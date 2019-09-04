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
    [Description("blow")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_BLOWTHRU : IReceiveBusiness, ISendUserBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var protocol = ((Message)message).protocol;
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
