using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("bye ")]
    public struct MSG_LOGOFF : IReceiveBusiness, ISendBroadcast
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            sessionState.driver.DropConnection();

            SendToServer(dbContext, message);
        }

        public void SendToServer(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var outboundPacket = new Protocols.MSG_LOGOFF
            {
                nbrUsers = (Int32)SessionManager.GetServerUserCount(),
            };

            SessionManager.SendToServer(outboundPacket, EventTypes.MSG_LOGOFF, (Int32)sessionState.UserID);
        }
    }
}
