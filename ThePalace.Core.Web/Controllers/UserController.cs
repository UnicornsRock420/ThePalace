using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;

namespace ThePalace.Server.Web.Controllers
{
    public class UserController : Controller
    {
        [HttpGet]
        public JsonResult ViewRoom(short? id)
        {
            if (id == null || id.Value == 0)
            {
                return Json(new { });
            }

            var ipAddress = Request.HttpContext.Connection.RemoteIpAddress.ToString();

            //if (!WebSocketConnectionManager.connectionStates.ContainsKey(ipAddress))
            //{
            //    return Json(new { });
            //}

            using (var dbContext = Database.For<ThePalaceEntities>())
            {
                dbContext.Database.ExecuteSqlCommand("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED");

                Core.Factories.RoomData.ReadRoom(dbContext, id.Value, out RoomRec roomRec);
                Core.Factories.RoomData.ReadHotspots(dbContext, id.Value, out List<HotspotRec> hotspotRecs);
                Core.Factories.RoomData.ReadPictures(dbContext, id.Value, out List<PictureRec> pictureRecs);
                Core.Factories.RoomData.ReadLooseProps(dbContext, id.Value, out List<LoosePropRec> loosePropRecs);
                Core.Factories.RoomData.ReadDrawCmds(dbContext, id.Value, out List<DrawCmdRec> drawCmdRecs);

                return Json(new
                {
                    room = new
                    {
                        roomID = roomRec.roomID,
                        name = roomRec.roomName,
                        flags = roomRec.roomFlags,
                        facesID = roomRec.facesID,
                        pictName = roomRec.roomPicture,
                        artistName = roomRec.roomArtist,
                    },
                    hotspots = hotspotRecs,
                    pictures = pictureRecs,
                    looseProps = loosePropRecs,
                    drawCmds = drawCmdRecs
                        .Select(d => new
                        {
                            type = d.type.ToString(),
                            layer = d.layer,
                            data = d.data.WritePalaceString(),
                        })
                        .ToList(),
                });
            }
        }

        [HttpGet]
        public IActionResult GetAsset(int? id)
        {
            if (id == null || id.Value == 0)
            {
                return null;
            }

            var ipAddress = Request.HttpContext.Connection.RemoteIpAddress.ToString();

            //if (!WebSocketConnectionManager.connectionStates.ContainsKey(ipAddress))
            //{
            //    return null;
            //}

            using (var dbContext = Database.For<ThePalaceEntities>())
            {
                dbContext.Database.ExecuteSqlCommand("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED");

                var asset = dbContext.Assets.AsNoTracking()
                    .Where(a => a.AssetId == id.Value)
                    .FirstOrDefault();

                if (asset != null)
                {
                    using (var packet = new Packet())
                    {
                        packet.WriteInt32(asset.AssetId);
                        packet.WriteInt32(asset.AssetCrc);
                        packet.WriteInt32(asset.Flags);
                        packet.WritePString(asset.Name ?? string.Empty, 128, 1);

                        if ((asset.Flags & (int)ServerAssetFlags.HighResProp) == 0)
                        {
                            packet.AppendBytes(asset.Data);
                        }

                        return new FileContentResult(packet.getData(), "palace/prop");
                    }
                }
            }

            return new NotFoundResult();
        }
    }
}
