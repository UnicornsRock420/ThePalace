using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("log ")]
    public struct MSG_USERLOG : ISendBroadcast
    {
        public void SendToServer(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            // Send User Log 'log '
            var outboundPacket = new Protocols.MSG_USERLOG
            {
                nbrUsers = SessionManager.GetServerUserCount(),
            };

            SessionManager.SendToServer(outboundPacket, EventTypes.MSG_USERLOG, (Int32)sessionState.UserID);
        }
    }
}
