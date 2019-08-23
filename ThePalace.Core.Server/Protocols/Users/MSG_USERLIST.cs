using Newtonsoft.Json;
using System.ComponentModel;
using System.Linq;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Protocols
{
    [Description("rprs")]
    public struct MSG_USERLIST : ISendProtocol
    {
        // typedef Int32 UserID

        public UserRec[] users;

        public byte[] Serialize(object input = null)
        {
            var message = (Message)input;

            users = SessionManager.sessionStates.Values
                .Where(c => c.UserID != message.sessionState.UserID)
                .Where(c => c.RoomID == message.sessionState.RoomID)
                .Select(u => u.details)
                .ToArray();

            using (var packet = new Packet())
            {
                foreach (var user in users)
                {
                    packet.WriteInt32(user.userID);
                    packet.AppendBytes(user.roomPos.Serialize());

                    for (int i = 0; i < 9; i++)
                    {
                        if (i < user.nbrProps && i < (user.propSpec?.Length ?? 0))
                            packet.AppendBytes(user.propSpec[i].Serialize());
                        else
                        {
                            packet.WriteInt32(0);
                            packet.WriteInt32(0);
                        }

                    }

                    packet.WriteInt16(user.roomID);
                    packet.WriteInt16(user.faceNbr);
                    packet.WriteInt16(user.colorNbr);
                    packet.WriteInt16(user.awayFlag);
                    packet.WriteInt16(user.openToMsgs);
                    packet.WriteInt16(user.nbrProps);
                    packet.WritePString(user.name, 32);
                }

                return packet.getData();
            }
        }

        public string SerializeJSON(object input = null)
        {
            var message = (Message)input;

            users = SessionManager.sessionStates.Values
                .Where(c => c.UserID != message.sessionState.UserID)
                .Where(c => c.RoomID == message.sessionState.RoomID)
                .Select(u => u.details)
                .ToArray();

            return JsonConvert.SerializeObject(new
            {
                users = users
                    .Select(u => new
                    {
                        userID = u.userID,
                        name = u.name,
                        faceNbr = u.faceNbr,
                        colorNbr = u.colorNbr,
                        awayFlag = u.awayFlag,
                        openToMsgs = u.openToMsgs,
                        roomPos = u.roomPos,
                        propSpec = u.propSpec,
                    })
                    .ToArray(),
            });
        }
    }
}
