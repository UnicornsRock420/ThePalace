using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Commands;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("talk")]
    public struct MSG_TALK : IReceiveBusiness
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

            var inboundPacket = (Protocols.MSG_TALK)protocol;
            var chatStr = inboundPacket.text;

            Logger.ConsoleLog($"MSG_TALK[{sessionState.UserID}]: {chatStr}");

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

            SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_TALK, (Int32)sessionState.UserID);
        }
    }
}
