using System;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Commands
{
    public class CMD_UNHIDE : ICommand
    {
        public const string Help = @"-- Cease hiding from other users.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = SessionManager.sessionStates[UserID];
            var xtlk = new MSG_XTALK();

            sessionState.userFlags &= ~(short)UserFlags.U_Hide;

            xtlk.text = $"You are now unhidden!";

            sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);

            return true;
        }
    }
}
