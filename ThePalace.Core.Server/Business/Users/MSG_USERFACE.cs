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
    [Description("usrF")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_USERFACE : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_USERFACE)protocol;

            sessionState.details.faceNbr = inboundPacket.faceNbr;

            SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_USERFACE, (Int32)sessionState.UserID);
        }
    }
}
