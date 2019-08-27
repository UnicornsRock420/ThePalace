using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ThePalace.Core.Database;
using ThePalace.Core.Utility;
using ThePalace.Server.Web.Enums;
using ThePalace.Server.Web.Utility;
using static ThePalace.Server.Web.Utility.Multipart;

namespace ThePalace.Server.Web.Controllers
{
    public class MediaController : Controller
    {
        [HttpGet]
        //[ValidateAntiForgeryToken]
        public JsonResult Index([FromRoute] string id = null, [FromQuery] UploadTypes? filter = null, [FromQuery] OrderByTypes? orderby = null, [FromQuery] short limit = 1000, [FromQuery] int offset = 0)
        {
            var files = new List<string>();
            var result = false;

            if (!string.IsNullOrWhiteSpace(id))
            {
                var hash = Guid.Parse(id);

                if (limit > 1000)
                {
                    limit = 1000;
                }

                using (var dbContext = Database.For<ThePalaceEntities>())
                {
                    if (dbContext.Sessions.Any(s => s.Hash == hash && s.UntilDate > DateTime.UtcNow))
                    {
                        var path = Path.Combine(Environment.CurrentDirectory, "wwwroot", "Media");

                        if (Directory.Exists(path))
                        {
                            try
                            {
                                var filterStr = string.Empty;

                                switch (filter ?? UploadTypes.All)
                                {
                                    case UploadTypes.Images:
                                        filterStr = "*.GIF;*.JPG;*.JPEG;*.PNG";

                                        break;
                                    case UploadTypes.Audio:
                                        filterStr = "*.WAV;*.MP3;*.MP4;*.MID;*.MIDI;*.OGG";

                                        break;
                                    case UploadTypes.Office:
                                        filterStr = "*.XLS;*.XLSX;*.DOC;*.DOCX;*.TXT";

                                        break;
                                    //case UploadTypes.All:
                                    default:
                                        filterStr = "*.*";

                                        break;
                                }

                                files = filterStr.Split(';')
                                    .SelectMany(f => Directory.GetFiles(path, f, SearchOption.TopDirectoryOnly))
                                    .ToList();

                                switch (orderby)
                                {
                                    case OrderByTypes.TypeAsc_NameAsc:
                                        files = files
                                            .OrderBy(f => Path.GetExtension(f))
                                            .ThenBy(f => Path.GetFileNameWithoutExtension(f))
                                            .ToList();

                                        break;
                                    //case OrderByTypes.LastModifiedDateDesc:
                                    default:
                                        files = files
                                            .OrderByDescending(f => System.IO.File.GetLastWriteTimeUtc(f))
                                            .ToList();
                                        break;
                                }

                                files = files
                                    .Select(f => Path.GetFileName(f))
                                    .Distinct()
                                    .Skip(offset)
                                    .Take(limit)
                                    .ToList();

                                result = true;
                            }
                            catch (Exception ex)
                            {
                                ex.Log();
                            }
                        }
                    }
                }
            }

            return Json(new
            {
                success = result,
                files = files,
            });
        }

        [HttpPost]
        //[ValidateAntiForgeryToken]
        public JsonResult Delete([FromRoute] string id = null, [FromQuery] string fileName = null)
        {
            var files = new List<string>();
            var result = false;

            if (!string.IsNullOrWhiteSpace(id) && !string.IsNullOrWhiteSpace(fileName))
            {
                var hash = Guid.Parse(id);

                using (var dbContext = Database.For<ThePalaceEntities>())
                {
                    if (dbContext.Sessions.Any(s => s.Hash == hash && s.UntilDate > DateTime.UtcNow))
                    {
                        var path = Path.Combine(Environment.CurrentDirectory, "wwwroot", "Media", fileName);

                        if (System.IO.File.Exists(path))
                        {
                            try
                            {
                                System.IO.File.Delete(path);

                                files.Add(fileName);

                                result = true;
                            }
                            catch (Exception ex)
                            {
                                ex.Log();

                                result = false;
                            }
                        }
                    }
                }
            }

            return Json(new
            {
                success = result,
                files = files,
            });
        }

        [HttpPost]
        //[ValidateAntiForgeryToken]
        public async Task<JsonResult> Upload([FromRoute] string id = null, [FromQuery] bool overwrite = false)
        {
            Request.EnableRewind();

            var files = new List<string>();
            var model = new MultipartModel();
            var result = false;

            if (!string.IsNullOrWhiteSpace(id) && Request.ContentLength > 0)
            {
                var hash = Guid.Parse(id);

                using (var dbContext = Database.For<ThePalaceEntities>())
                {
                    if (dbContext.Sessions.Any(s => s.Hash == hash && s.UntilDate > DateTime.UtcNow))
                    {
                        var path = Path.Combine(Environment.CurrentDirectory, "wwwroot", "Media");

                        if (Directory.Exists(path))
                        {
                            result = true;

                            Request.Body.GetFiles(model);

                            foreach (var file in model.files)
                            {
                                var fileName = Path.GetFileName(file.Filename).ToLower();
                                var filePath = Path.Combine(path, fileName);

                                if (overwrite || !System.IO.File.Exists(filePath))
                                {
                                    files.Add(fileName);

                                    try
                                    {
                                        using (var stream = new FileStream(filePath, FileMode.Create))
                                        {
                                            await stream.WriteAsync(file.FileContents);
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        ex.Log();

                                        result = false;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return Json(new
            {
                success = result,
                files = files,
            });
        }
    }
}
