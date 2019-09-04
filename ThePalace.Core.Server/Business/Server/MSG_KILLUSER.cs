using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("kill")]
    [AdminOnlyProtocol]
    [SuccessfullyConnectedProtocol]
    public struct MSG_KILLUSER : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_KILLUSER)protocol;
            var targetSession = SessionManager.sessionStates[inboundPacket.target];

            targetSession.Send(null, EventTypes.MSG_SERVERDOWN, (Int32)ServerDownFlags.SD_KilledBySysop);

            targetSession.driver.DropConnection();
        }
    }
}
