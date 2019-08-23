using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("usrP")]
    public struct MSG_USERPROP : IReceiveBusiness
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

            var inboundPacket = (Protocols.MSG_USERPROP)protocol;

            if (!sessionState.Authorized)
            {
                if ((sessionState.userFlags & (int)(UserFlags.U_PropGag | UserFlags.U_Pin)) != 0)
                {
                    inboundPacket.nbrProps = 0;
                    inboundPacket.propSpec = null;

                    SessionManager.Send(sessionState, inboundPacket, EventTypes.MSG_USERPROP, (Int32)sessionState.UserID);

                    return;
                }
            }

            sessionState.details.nbrProps = inboundPacket.nbrProps;
            sessionState.details.propSpec = inboundPacket.propSpec;

            AssetLoader.CheckAssets(sessionState, inboundPacket.propSpec);

            SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_USERPROP, (Int32)sessionState.UserID);
        }
    }
}
