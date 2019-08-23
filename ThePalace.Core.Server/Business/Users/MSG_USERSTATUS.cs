using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("uSta")]
    public struct MSG_USERSTATUS : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            // Send User Status 'uSta'
            var outboundPacket = new Protocols.MSG_USERSTATUS
            {
                flags = sessionState.userFlags,
            };

            sessionState.Send(outboundPacket, EventTypes.MSG_USERSTATUS, (Int32)sessionState.UserID);
        }
    }
}
