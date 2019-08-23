using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("blow")]
    public struct MSG_BLOWTHRU : IReceiveBusiness, ISendUserBusiness
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

            var inboundPacket = (Protocols.MSG_BLOWTHRU)protocol;

            if (inboundPacket.nbrUsers > 0)
            {
                for (var j = 0; j < inboundPacket.userIDs.Count; j++)
                {
                    SendToUser(dbContext, message, inboundPacket.userIDs[j]);
                }
            }
        }

        public void SendToUser(ThePalaceEntities dbContext, object message, UInt32 TargetID)
        {
            var protocol = ((Message)message).protocol;
            var header = ((Message)message).header;

            var inboundPacket = (Protocols.MSG_BLOWTHRU)protocol;

            SessionManager.SendToUserID(TargetID, inboundPacket, EventTypes.MSG_BLOWTHRU, header.refNum);
        }
    }
}
