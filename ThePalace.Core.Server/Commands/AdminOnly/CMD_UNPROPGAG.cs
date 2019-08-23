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
    public class CMD_UNPROPGAG : ICommand
    {
        public const string Help = @"-- Unpropgag a previously propgagged user (see the `propgag command).";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = SessionManager.sessionStates[UserID];
            var xtlk = new MSG_XTALK();

            if (TargetID == 0)
            {
                xtlk.text = "Sorry, you must target a user to use this command.";

                sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
            }
            else
            {
                var targetSessionState = SessionManager.sessionStates[TargetID];

                targetSessionState.userFlags &= ~(short)UserFlags.U_PropGag;

                xtlk.text = $"User {targetSessionState.details.name} is now unpropgagged!";

                SessionManager.SendToRoomID(sessionState.RoomID, 0, xtlk, EventTypes.MSG_XTALK, 0);
            }

            return true;
        }
    }
}
