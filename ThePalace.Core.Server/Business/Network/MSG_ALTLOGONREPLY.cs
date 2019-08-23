using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("rep2")]
    public struct MSG_ALTLOGONREPLY : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            // Send 'rep2'
            //var inboundPacket = (Protocols.MSG_LOGON)message.protocol;
            var outboundPacket = new Protocols.MSG_ALTLOGONREPLY
            {
                reg = sessionState.reg,
            };

            sessionState.Send(outboundPacket, EventTypes.MSG_ALTLOGONREPLY, (Int32)sessionState.UserID);
        }
    }
}
