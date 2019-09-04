using System;
using System.ComponentModel;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("usrD")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_USERDESC : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var header = ((Message)message).header;
            var inboundPacket = (Protocols.MSG_USERDESC)protocol;
            var user = dbContext.UserData
                .Where(u => u.UserId == sessionState.UserID)
                .FirstOrDefault();

            user.FaceNbr = inboundPacket.faceNbr;
            user.ColorNbr = inboundPacket.colorNbr;

            dbContext.SaveChanges();

            if (!sessionState.Authorized)
            {
                if ((sessionState.userFlags & (int)(UserFlags.U_PropGag | UserFlags.U_Pin)) != 0)
                {
                    sessionState.details.faceNbr = inboundPacket.faceNbr;
                    sessionState.details.colorNbr = inboundPacket.colorNbr;


                    sessionState.details.nbrProps = 0;
                    sessionState.details.propSpec = null;

                    return;
                }
            }

            sessionState.details.faceNbr = inboundPacket.faceNbr;
            sessionState.details.colorNbr = inboundPacket.colorNbr;
            sessionState.details.nbrProps = (Int16)inboundPacket.nbrProps;
            sessionState.details.propSpec = inboundPacket.propSpec;

            AssetLoader.CheckAssets(sessionState, inboundPacket.propSpec);

            SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, (EventTypes)Enum.Parse(typeof(EventTypes), header.eventType), header.refNum);
        }
    }
}
