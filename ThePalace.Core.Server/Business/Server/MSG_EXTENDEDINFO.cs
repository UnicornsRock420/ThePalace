using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("sInf")]
    public struct MSG_EXTENDEDINFO : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;

            var inboundPacket = (Protocols.MSG_EXTENDEDINFO)protocol;

            sessionState.Send(inboundPacket, EventTypes.MSG_EXTENDEDINFO, (Int32)sessionState.UserID);
        }
    }
}
