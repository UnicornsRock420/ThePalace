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
    [Description("xwis")]
    public struct MSG_XWHISPER : IReceiveBusiness
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

            var inboundPacket = (Protocols.MSG_XWHISPER)protocol;
            var chatStr = inboundPacket.text;

            Logger.ConsoleLog($"MSG_XWHISPER[{sessionState.UserID} -> {inboundPacket.target}]: {chatStr}");

            if (CommandsEngine.Eval(dbContext, sessionState.UserID, inboundPacket.target, chatStr))
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

            if (!SessionManager.sessionStates.ContainsKey(inboundPacket.target))
            {
                var outboundPack = new Protocols.MSG_XTALK
                {
                    text = "Sorry, was unable to locate that user."
                };

                sessionState.Send(outboundPack, EventTypes.MSG_XTALK, 0);

                return;
            }

            var targetSessionState = SessionManager.sessionStates[inboundPacket.target];

            if (targetSessionState.RoomID == sessionState.RoomID && (targetSessionState.userFlags & (int)UserFlags.U_RejectPrivate) != 0)
            {
                var outboundPack = new Protocols.MSG_XTALK
                {
                    text = "Sorry, but this user has whispers turned off."
                };

                sessionState.Send(outboundPack, EventTypes.MSG_XTALK, 0);
            }
            else if (targetSessionState.RoomID != sessionState.RoomID && (targetSessionState.userFlags & (int)UserFlags.U_RejectEsp) != 0)
            {
                var outboundPack = new Protocols.MSG_XTALK
                {
                    text = "Sorry, but this user has ESP turned off."
                };

                sessionState.Send(outboundPack, EventTypes.MSG_XTALK, 0);
            }
            else
            {
                sessionState.Send(inboundPacket, EventTypes.MSG_XWHISPER, (Int32)sessionState.UserID);

                targetSessionState.Send(inboundPacket, EventTypes.MSG_XWHISPER, (Int32)sessionState.UserID);
            }
        }
    }
}
