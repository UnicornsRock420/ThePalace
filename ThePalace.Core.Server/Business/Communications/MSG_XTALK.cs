using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Commands;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("xtlk")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_XTALK : IReceiveBusiness, ISendStaffBroadcast
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_XTALK)protocol;
            var chatStr = inboundPacket.text;

            Logger.ConsoleLog($"MSG_XTALK[{sessionState.UserID}]: {chatStr}");

            if (CommandsEngine.Eval(dbContext, sessionState.UserID, 0, chatStr))
            {
                return;
            }

            if (!sessionState.Authorized)
            {
                if ((sessionState.userFlags & (int)UserFlags.U_Gag) != 0)
                {
                    return;
                }
            }

            SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_XTALK, (Int32)sessionState.UserID);
        }

        public void SendToUserID(ThePalaceEntities dbContext, Message message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_XTALK)protocol;
            SessionManager.SendToUserID(sessionState.UserID, inboundPacket, EventTypes.MSG_XTALK, 0);
        }

        public void SendToStaff(ThePalaceEntities dbContext, object message)
        {
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_XTALK)protocol;
            SessionManager.SendToStaff(inboundPacket, EventTypes.MSG_XTALK, 0);
        }
    }
}
