using Newtonsoft.Json;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Protocols
{
    [Description("nprs")]
    public struct MSG_USERNEW : ISendProtocol
    {
        public UserRec user;

        public byte[] Serialize(object input = null)
        {
            var message = (Message)input;
            SessionState sessionState;

            try
            {
                sessionState = SessionManager.sessionStates[(UInt16)message.header.refNum];
            }
            catch (Exception ex)
            {
                ex.DebugLog();

                return null;
            }

            user = sessionState.details;

            using (var packet = new Packet())
            {
                packet.WriteInt32(user.userID);
                packet.AppendBytes(user.roomPos.Serialize());

                for (var j = 0; j < 9; j++)
                {
                    if (j < user.nbrProps && j < user.propSpec.Length)
                    {
                        packet.AppendBytes(user.propSpec[j].Serialize());
                    }
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
                packet.WriteInt16((Int16)user.nbrProps);
                packet.WritePString(user.name, 32);

                return packet.getData();
            }
        }

        public string SerializeJSON(object input = null)
        {
            var message = (Message)input;
            var sessionState = SessionManager.sessionStates[(UInt16)message.header.refNum];

            user = sessionState.details;

            return JsonConvert.SerializeObject(new
            {
                user,
            });
        }
    }
}
