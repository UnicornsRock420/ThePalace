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
    [Description("uLst")]
    public struct MSG_LISTOFALLUSERS : IReceiveProtocol, ISendProtocol
    {
        public UInt32 nbrUsers;

        public void Deserialize(Packet packet)
        {
        }

        public byte[] Serialize(object input = null)
        {
            var message = (Message)input;

            using (var dbContext = Database.For<ThePalaceEntities>())
            {
                var query = SessionManager.sessionStates.Values
                    .Where(s => s.successfullyConnected == true)
                    .AsQueryable();

                if (!message.sessionState.Authorized)
                {
                    query = query
                        .Where(u => (u.userFlags & (Int32)(UserFlags.U_Hide)) == 0);
                }

                var users = query
                    .AsEnumerable()
                    .Select(u => new ListBuilder
                    {
                        primaryID = (UInt32)u.UserID,
                        name = u.details.name,
                        flags = (Int16)u.userFlags,
                        refNum = (Int16)u.RoomID,
                    }.Serialize())
                    .ToList();

                nbrUsers = (UInt32)users.Count;

                return users
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
                var query = SessionManager.sessionStates.Values
                    .Where(s => s.successfullyConnected == true)
                    .AsQueryable();

                if (!message.sessionState.Authorized)
                {
                    query = query
                        .Where(u => (u.userFlags & (Int32)(UserFlags.U_Hide)) == 0);
                }

                var users = query
                    .AsEnumerable()
                    .Select(u => new ListBuilder
                    {
                        primaryID = (UInt32)u.UserID,
                        name = u.details.name,
                        flags = (Int16)u.userFlags,
                        refNum = (Int16)u.RoomID,
                    })
                    .ToList();

                return JsonConvert.SerializeObject(new
                {
                    list = users,
                });
            }
        }
    }
}
