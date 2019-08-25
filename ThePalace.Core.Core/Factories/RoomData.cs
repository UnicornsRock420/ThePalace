using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Types;

namespace ThePalace.Core.Factories
{
    public static class RoomData
    {
        #region Database

        public static bool Peek(this ThePalaceEntities dbContext, Int16 roomID, out RoomRec roomData)
        {
            var room = dbContext.Rooms.AsNoTracking()
                .Where(r => r.RoomId == roomID)
                .FirstOrDefault();

            if (room == null)
            {
                roomData = null;

                return false;
            }

            roomData = new RoomRec
            {
                roomName = room.Name,
                roomFlags = room.Flags,
                roomMaxOccupancy = room.MaxOccupancy,
                roomLastModified = room.LastModified ?? room.CreateDate,
            };

            return true;
        }

        public static bool ReadRoom(this ThePalaceEntities dbContext, Int16 roomID, out RoomRec roomData)
        {
            var room = dbContext.Rooms.AsNoTracking()
                .Where(r => r.RoomId == roomID)
                .Join(
                    dbContext.RoomData.AsNoTracking(),
                    r => r.RoomId,
                    e => e.RoomId,
                    (r, e) => new { r, e }
                )
                .FirstOrDefault();

            if (room == null)
            {
                roomData = null;

                return false;
            }

            roomData = new RoomRec
            {
                roomID = room.r.RoomId,
                roomName = room.r.Name,
                roomFlags = room.r.Flags,
                roomMaxOccupancy = room.r.MaxOccupancy,
                roomLastModified = room.r.LastModified ?? room.r.CreateDate,

                facesID = room.e.FacesId,
                roomArtist = room.e.ArtistName,
                roomPicture = room.e.PictureName,
                roomPassword = room.e.Password,
            };

            return true;
        }

        public static void ReadHotspots(this ThePalaceEntities dbContext, Int16 roomID, out List<HotspotRec> Hotspots)
        {
            var roomStates = dbContext.States.AsNoTracking()
                .Where(s => s.RoomId == roomID)
                .OrderBy(s => s.StateId)
                .ToList();

            var roomVortexes = dbContext.Vortexes
                .Where(s => s.RoomId == roomID)
                .OrderBy(s => s.VortexId)
                .ToList();

            Hotspots = dbContext.Hotspots2.AsNoTracking()
                .Where(h => h.RoomId == roomID)
                .AsEnumerable()
                .Select(h =>
                {
                    var result = new HotspotRec
                    {
                        id = h.HotspotId,
                        name = h.Name,
                        flags = h.Flags,
                        type = (HotspotTypes)h.Type,
                        dest = (Int16)h.Dest,
                        script = h.Script,
                        state = h.State,
                        loc = new Point
                        {
                            h = h.LocH ?? 0,
                            v = h.LocV ?? 0,
                        },
                    };

                    result.states = roomStates
                        .Where(s => s.HotspotId == h.HotspotId)
                        .Select(s => new HotspotStateRec
                        {
                            pictID = s.PictureId ?? 0,
                            picLoc = new Point
                            {
                                h = s.LocH ?? 0,
                                v = s.LocV ?? 0,
                            },
                        })
                        .ToList();

                    result.Vortexes = roomVortexes
                        .Where(s => s.HotspotId == h.HotspotId)
                        .Select(s => new Point
                        {
                            h = s.LocH,
                            v = s.LocV,
                        })
                        .ToList();

                    result.nbrPts = (short)result.Vortexes.Count;

                    return result;
                })
                .ToList();
        }

        public static void ReadDrawCmds(this ThePalaceEntities dbContext, Int16 roomID, out List<DrawCmdRec> DrawCmds)
        {
            DrawCmds = dbContext.DrawCmds2.AsNoTracking()
                .Where(d => d.RoomId == roomID)
                .OrderBy(d => d.DrawCmdId)
                .AsEnumerable()
                .Select(d => new DrawCmdRec
                {
                    drawCmd = d.DrawCmdType,
                    data = d.Data,
                })
                .ToList();
        }

        public static void ReadLooseProps(this ThePalaceEntities dbContext, Int16 roomID, out List<LoosePropRec> LooseProps)
        {
            LooseProps = dbContext.LooseProps1.AsNoTracking()
                .Where(p => p.RoomId == roomID)
                .OrderBy(p => p.OrderId)
                .AsEnumerable()
                .Select(p => new LoosePropRec
                {
                    propSpec = new AssetSpec
                    {
                        id = p.AssetId,
                        crc = (UInt32)p.AssetCrc,
                    },
                    flags = p.Flags,
                    loc = new Point
                    {
                        h = p.LocH,
                        v = p.LocV,
                    },
                })
                .ToList();
        }

        public static void ReadPictures(this ThePalaceEntities dbContext, Int16 roomID, out List<PictureRec> Pictures)
        {
            Pictures = dbContext.Pictures2.AsNoTracking()
                .Where(p => p.RoomId == roomID)
                .OrderBy(p => p.PictureId)
                .AsEnumerable()
                .Select(p => new PictureRec
                {
                    name = p.Name,
                    picID = p.PictureId,
                    transColor = p.TransColor ?? 0,
                })
                .ToList();
        }

        public static void WriteRoom(this ThePalaceEntities dbContext, Int16 roomID, RoomRec inputRoomData)
        {
            var room = dbContext.Rooms
                .Where(r => r.RoomId == roomID)
                .FirstOrDefault();

            if (room == null)
            {
                room = new Rooms
                {
                    RoomId = roomID,
                    CreateDate = DateTime.UtcNow,
                };

                dbContext.Rooms.Add(room);
            }
            else
            {
                room.LastModified = DateTime.UtcNow;
            }

            room.Name = inputRoomData.roomName;
            room.Flags = inputRoomData.roomFlags;
            room.MaxOccupancy = inputRoomData.roomMaxOccupancy;

            var roomData = dbContext.RoomData
                .Where(e => e.RoomId == roomID)
                .FirstOrDefault();

            if (roomData == null)
            {
                roomData = new Database.RoomData
                {
                    RoomId = roomID,
                };

                dbContext.RoomData.Add(roomData);
            }

            roomData.FacesId = inputRoomData.facesID;
            roomData.ArtistName = inputRoomData.roomArtist;
            roomData.Password = inputRoomData.roomPassword;
            roomData.PictureName = inputRoomData.roomPicture;
        }

        public static void WriteHotspots(this ThePalaceEntities dbContext, Int16 roomID, List<HotspotRec> Hotspots)
        {
            var states = new List<States>();
            var vortexes = new List<Vortexes>();

            dbContext.Hotspots2.AddRange(
                Hotspots
                   .Select(h =>
                   {
                       var vortexID = (Int16)0;
                       var stateID = (Int16)0;
                       var result = new Hotspots2
                       {
                           RoomId = roomID,
                           HotspotId = h.id,
                           Name = h.name ?? string.Empty,
                           Flags = h.flags,
                           Dest = h.dest,
                           LocH = h.loc.h,
                           LocV = h.loc.v,
                           Type = (Int16)h.type,
                           Script = h.script,
                           State = h.state,
                       };

                       if (h.states != null && h.states.Count > 0)
                       {
                           foreach (var state in h.states)
                           {
                               states.Add(
                                   new States
                                   {
                                       RoomId = roomID,
                                       HotspotId = h.id,
                                       StateId = ++stateID,
                                       PictureId = state.pictID,
                                       LocH = state.picLoc.h,
                                       LocV = state.picLoc.v,
                                   });
                           }
                       }

                       if (h.Vortexes != null && h.Vortexes.Count > 0)
                       {
                           foreach (var vortex in h.Vortexes)
                           {
                               vortexes.Add(
                                   new Vortexes
                                   {
                                       RoomId = roomID,
                                       HotspotId = h.id,
                                       VortexId = ++vortexID,
                                       LocH = vortex.h,
                                       LocV = vortex.v,
                                   });
                           }
                       }

                       return result;
                   })
                .ToList());

            dbContext.States.AddRange(states);
            dbContext.Vortexes.AddRange(vortexes);
        }

        public static void WriteDrawCmds(this ThePalaceEntities dbContext, Int16 roomID, List<DrawCmdRec> DrawCmds)
        {
            var drawCmdID = (Int16)0;
            var vortexes2 = new List<Vortexes>();

            dbContext.DrawCmds2.AddRange(
                DrawCmds
                    .Select(d =>
                    {
                        var result = new DrawCmds2
                        {
                            RoomId = roomID,
                            DrawCmdType = (short)d.drawCmd,
                            DrawCmdId = ++drawCmdID,
                            Data = d.data,
                        };

                        return result;
                    })
                .ToList());
        }

        public static void WriteLooseProps(this ThePalaceEntities dbContext, Int16 roomID, List<LoosePropRec> LooseProps)
        {
            var loosePropOrderID = 0;

            dbContext.LooseProps1.AddRange(
                LooseProps
                    .Select(p => new LooseProps1
                    {
                        RoomId = roomID,
                        OrderId = ++loosePropOrderID,
                        AssetId = p.propSpec.id,
                        AssetCrc = (Int32)p.propSpec.crc,
                        Flags = p.flags,
                        LocH = p.loc.h,
                        LocV = p.loc.v,
                    })
                .ToList());
        }

        public static void WritePictures(this ThePalaceEntities dbContext, Int16 roomID, List<PictureRec> Pictures)
        {
            dbContext.Pictures2.AddRange(
                Pictures
                    .Select(p => new Pictures2
                    {
                        RoomId = roomID,
                        Name = p.name,
                        PictureId = p.picID,
                        TransColor = p.transColor,
                    })
                .ToList());
        }

        #endregion
    }
}
