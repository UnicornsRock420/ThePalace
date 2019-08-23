using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.ComponentModel;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Factories;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Protocols
{
    [Description("rLst")]
    public struct MSG_LISTOFALLROOMS : IReceiveProtocol, ISendProtocol
    {
        public UInt32 nbrRooms;

        public void Deserialize(Packet packet)
        {
        }

        public byte[] Serialize(object input = null)
        {
            var message = (Message)input;

            using (var dbContext = Database.For<ThePalaceEntities>())
            {
                var query = dbContext.Rooms.AsNoTracking()
                        .AsQueryable();

                if (!message.sessionState.Authorized)
                {
                    query = query
                        .Where(r => (r.Flags & (Int32)RoomFlags.RF_Hidden) == 0);
                }

                var rooms = query
                    .AsEnumerable()
                    .Select(r => new ListBuilder
                    {
                        primaryID = (UInt32)r.RoomId,
                        name = r.Name,
                        flags = (Int16)r.Flags,
                        refNum = (Int16)SessionManager.GetRoomUserCount(r.RoomId),
                    }.Serialize())
                    .ToList();

                nbrRooms = (UInt32)rooms.Count();

                return rooms
                    .SelectMany(b => b)
                    .ToArray();
            }
        }

        public void DeserializeJSON(string json)
        {
        }

        public string SerializeJSON(object input = null)
        {
            var message = (Message)input;

            using (var dbContext = Database.For<ThePalaceEntities>())
            {
                var query = dbContext.Rooms.AsNoTracking()
                        .AsQueryable();

                if (!message.sessionState.Authorized)
                {
                    query = query
                        .Where(r => (r.Flags & (Int32)RoomFlags.RF_Hidden) == 0);
                }

                var rooms = query
                    .AsEnumerable()
                    .Select(r => new ListBuilder
                    {
                        primaryID = (UInt32)r.RoomId,
                        name = r.Name,
                        flags = (Int16)r.Flags,
                        refNum = (Int16)SessionManager.GetRoomUserCount(r.RoomId),
                    })
                    .ToList();

                return JsonConvert.SerializeObject(new
                {
                    list = rooms,
                });
            }
        }
    }
}
