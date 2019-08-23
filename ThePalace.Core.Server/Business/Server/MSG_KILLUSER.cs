using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("kill")]
    public struct MSG_KILLUSER : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;

            if (!sessionState.successfullyConnected)
            {
                new MSG_SERVERDOWN
                {
                    reason = ServerDownFlags.SD_CommError,
                    whyMessage = "Communication Error!",
                }.Send(dbContext, message);

                sessionState.driver.DropConnection();

                return;
            }

            if (sessionState.Authorized)
            {
                var inboundPacket = (Protocols.MSG_KILLUSER)protocol;
                var targetSession = SessionManager.sessionStates[inboundPacket.target];

                targetSession.Send(null, EventTypes.MSG_SERVERDOWN, (Int32)ServerDownFlags.SD_KilledBySysop);

                targetSession.driver.DropConnection();
            }
            else
            {
                var xtlk = new Protocols.MSG_XTALK
                {
                    text = "Sorry, this is an Admin only feature.",
                };

                sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
            }
        }
    }
}
