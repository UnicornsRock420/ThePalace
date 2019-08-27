using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Utility;
using ThePalace.Server.Web.Models;
using ThePalace.Server.Web.Utility;

namespace ThePalace.Server.Web.Controllers
{
    public class PropsWSController : Controller
    {
        [HttpPost()]
        public async Task<ContentResult> get()
        {
            Request.EnableRewind();

            var result = new PropWSGetResponse
            {
                props = new List<PropWSGetResponseProp>(),
            };
            var nbrProps = 0;

            var ipAddress = Request.HttpContext.Connection.RemoteIpAddress.ToString();
            var data = await Request.getRawPostData((int)Request.ContentLength.Value);
            var jsonResponse = (dynamic)null;
            var json = (string)null;

            var actions = new List<Action>
            {
                () =>
                {
                    json = data.InvokePHP(PHPCommands.GZUNCOMPRESS);
                },
                () =>
                {
                    json = data.InvokePHP(PHPCommands.GZDECODE);
                },
                () =>
                {
                    json = data.InvokePHP(PHPCommands.GZINFLATE);
                },
                () =>
                {
                    json = data.GetString();
                },
            };

            foreach (var action in actions)
            {
                action();

                if (!string.IsNullOrWhiteSpace(json))
                {
                    try
                    {
                        jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);
                        nbrProps = jsonResponse.props.Count;

                        break;
                    }
                    catch
                    {
                        nbrProps = 0;
                    }
                }
            }

            if (nbrProps > 0)
            {
                using (var dbContext = Database.For<ThePalaceEntities>())
                {
                    dbContext.Database.ExecuteSqlCommand("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED");

                    for (var j = 0; j < nbrProps; j++)
                    {
                        var id = (Int32)jsonResponse.props[j].id;
                        var asset = dbContext.Assets.AsNoTracking()
                            .Where(a => a.AssetId == id)
                            .Where(a => (a.Flags & (int)ServerAssetFlags.HighResProp) != 0)
                            .FirstOrDefault();
                        var metaData = dbContext.Metadata.AsNoTracking()
                            .Where(a => a.AssetId == id)
                            .FirstOrDefault();

                        if (asset != null && metaData != null)
                        {
                            result.props.Add(new PropWSGetResponseProp
                            {
                                id = id,
                                crc = (UInt32)asset.AssetCrc,
                                flags = metaData.Flags.ToString(),
                                name = asset.Name,
                                format = metaData.Format,
                                size = new PropWSGetResponseSize
                                {
                                    w = metaData.Width,
                                    h = metaData.Height,
                                },
                                offsets = new PropWSGetResponseOffset
                                {
                                    x = metaData.OffsetX,
                                    y = metaData.OffsetY,
                                },
                                success = true,
                            });
                        }
                    }
                }
            }

            var baseUri = new Uri(ConfigManager.GetValue("MediaUrl", string.Empty));
            var extUri = new Uri(baseUri, "webservice/props/download/");
            var absUrl = extUri.AbsoluteUri;

            result.img_url = absUrl;

            json = JsonConvert.SerializeObject(result);
            json = json.Replace(absUrl, absUrl.Replace("/", @"\/"));

            return Content(json, "application/json");
        }

        [HttpGet]
        public IActionResult download(int? id = null)
        {
            Request.EnableRewind();

            if (id.HasValue)
            {
                using (var dbContext = Database.For<ThePalaceEntities>())
                {
                    dbContext.Database.ExecuteSqlCommand("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED");

                    var byteArray = dbContext.Assets.AsNoTracking()
                        .Where(a => a.AssetId == id.Value)
                        .Where(a => (a.Flags & (int)ServerAssetFlags.HighResProp) != 0)
                        .Select(a => a.Data)
                        .FirstOrDefault();
                    var format = dbContext.Metadata.AsNoTracking()
                        .Where(a => a.AssetId == id.Value)
                        .Select(a => a.Format)
                        .FirstOrDefault();

                    if (byteArray != null && byteArray.Length > 0 && !string.IsNullOrWhiteSpace(format))
                    {
                        return new FileContentResult(byteArray, string.Concat("image/", format));
                    }
                }
            }

            return new NotFoundResult();
        }

        [HttpPost]
        public async Task<ContentResult> @new()
        {
            Request.EnableRewind();

            var json = await Request.getRawPostData();
            var jsonResponse = (dynamic)null;
            var nbrProps = 0;
            var result = new PropWSNewResponse
            {
                props = new List<PropWSNewResponseProp>(),
            };

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);
                nbrProps = jsonResponse.props.Count;
            }
            catch
            {
                nbrProps = 0;
            }

            if (nbrProps > 0)
            {
                using (var dbContext = Database.For<ThePalaceEntities>())
                {
                    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                    {
                        for (var j = 0; j < nbrProps; j++)
                        {
                            var id = (Int32)jsonResponse.props[j].id;
                            var asset = dbContext.Assets.AsNoTracking()
                                .Where(a => a.AssetId == id)
                                //.Where(a => (a.Flags & (int)ServerAssetFlags.HighResProp) != 0)
                                .FirstOrDefault();
                            var metaData = dbContext.Metadata.AsNoTracking()
                                .Where(a => a.AssetId == id)
                                .FirstOrDefault();
                            var newMetaData = false;
                            var newAsset = false;

                            if (asset == null)
                            {
                                newAsset = true;

                                asset = new Assets
                                {
                                    AssetId = id,
                                };
                            }

                            asset.AssetCrc = (Int32)(UInt32)jsonResponse.props[j].crc;
                            asset.Flags = (Int32)ServerAssetFlags.HighResProp;
                            asset.Name = (string)jsonResponse.props[j].name;
                            asset.LastUsed = DateTime.UtcNow;
                            asset.Data = null;

                            if (newAsset)
                            {
                                dbContext.Assets.Add(asset);
                            }

                            if (metaData == null)
                            {
                                newMetaData = true;

                                metaData = new Metadata
                                {
                                    AssetId = id,
                                };
                            }

                            metaData.Flags = ((string)jsonResponse.props[j].flags).TryParse<int>(0).Value;
                            metaData.Format = (string)jsonResponse.props[j].format;
                            metaData.Width = (Int16)jsonResponse.props[j].size.w;
                            metaData.Height = (Int16)jsonResponse.props[j].size.h;
                            metaData.OffsetX = (Int16)jsonResponse.props[j].offsets.x;
                            metaData.OffsetY = (Int16)jsonResponse.props[j].offsets.y;

                            if (newMetaData)
                            {
                                dbContext.Metadata.Add(metaData);
                            }

                            if (newAsset || newMetaData)
                            {
                                result.props.Add(new PropWSNewResponseProp
                                {
                                    id = id,
                                });
                            }
                        }

                        if (dbContext.HasUnsavedChanges())
                        {
                            try
                            {
                                dbContext.SaveChanges();

                                dbContextTransaction.Commit();
                            }
                            catch (Exception ex)
                            {
                                dbContextTransaction.Rollback();

                                result.props.Clear();

                                ex.Log();
                            }
                        }
                    }
                }
            }

            var baseUri = new Uri(ConfigManager.GetValue("MediaUrl", string.Empty));
            var extUri = new Uri(baseUri, "webservice/props/upload/");
            var absUrl = extUri.AbsoluteUri;

            result.upload_url = absUrl;

            json = JsonConvert.SerializeObject(result);
            json = json.Replace(absUrl, absUrl.Replace("/", @"\/"));

            //Response.Charset = string.Empty;
            return Content(json, "application/json");
        }

        [HttpPost]
        public async Task<ContentResult> upload()
        {
            Request.EnableRewind();

            var boundary = $"\r\n--{Regex.Match(Request.ContentType, @"^multipart/form-data; charset=UTF-8; boundary=(.+)$", RegexOptions.IgnoreCase | RegexOptions.Singleline).Groups[1].Value}";
            var length = (int)Request.ContentLength.Value;
            var data = await Request.getRawPostData(length);
            var form = data.GetString();

            var str = "Content-Disposition: form-data; name=\"id\"\r\n\r\n";
            var dispositionPos = form.IndexOf(str) + str.Length;
            var nextBoundary = form.IndexOf(boundary, dispositionPos);
            var propId = 0;
            var limit = 0;

            if (nextBoundary > -1)
            {
                limit = nextBoundary;
            }

            propId = data.GetString(limit, dispositionPos).TryParse<int>(0).Value;

            if (propId != 0)
            {
                using (var dbContext = Database.For<ThePalaceEntities>())
                {
                    var asset = dbContext.Assets
                        .Where(a => a.AssetId == propId)
                        .Where(a => (a.Flags & (int)ServerAssetFlags.HighResProp) != 0)
                        .FirstOrDefault();

                    if (nextBoundary > -1)
                    {
                        if (asset != null)
                        {
                            str = "Content-Disposition: form-data; name=\"prop\"\r\n\r\n";
                            dispositionPos = form.IndexOf(str) + str.Length;
                            nextBoundary = form.IndexOf(boundary, dispositionPos);

                            if (nextBoundary > -1)
                            {
                                asset.Data = data
                                    .Skip(dispositionPos)
                                    .Take(nextBoundary - dispositionPos)
                                    .ToArray();
                            }
                        }
                    }

                    if (nextBoundary < 0)
                    {
                        var metaData = dbContext.Metadata
                            .Where(a => a.AssetId == propId)
                            .FirstOrDefault();

                        if (metaData != null)
                        {
                            dbContext.Metadata.Remove(metaData);
                        }

                        if (asset != null)
                        {
                            dbContext.Assets.Remove(asset);
                        }
                    }

                    if (dbContext.HasUnsavedChanges())
                    {
                        try
                        {
                            dbContext.SaveChanges();
                        }
                        catch (Exception ex)
                        {
                            ex.Log();
                        }
                    }
                }
            }

            var json = JsonConvert.SerializeObject(new
            {
                success = nextBoundary > -1 && propId != 0,
                id = propId,
            });

            return Content(json, "application/json");
        }

        private IDisposable MemoryStream()
        {
            throw new NotImplementedException();
        }
    }
}
