using System;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Commands
{
    [AdminOnlyCommand]
    public class CMD_GAG : ICommand
    {
        public const string Help = @"-- Gag currently connected user <user>.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = SessionManager.sessionStates[UserID];
            var xtlk = new MSG_XTALK();

            var targetSessionState = SessionManager.sessionStates[TargetID];

            targetSessionState.userFlags |= (short)UserFlags.U_Gag;

            xtlk.text = $"User {targetSessionState.details.name} is now gagged!";

            SessionManager.SendToRoomID(sessionState.RoomID, 0, xtlk, EventTypes.MSG_XTALK, 0);

            return true;
        }
    }
}
