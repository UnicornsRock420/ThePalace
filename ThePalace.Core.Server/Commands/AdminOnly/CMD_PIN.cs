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
    public class CMD_PIN : ICommand
    {
        public const string Help = @"-- Pin <user> so that he or she can't move.";

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

                targetSessionState.userFlags |= (short)UserFlags.U_Pin;
                targetSessionState.details.nbrProps = 0;
                targetSessionState.details.propSpec = null;

                SessionManager.SendToRoomID(targetSessionState.RoomID, 0, new MSG_USERPROP
                {
                    nbrProps = 0,
                    propSpec = null,
                }, EventTypes.MSG_USERPROP, (Int32)TargetID);

                xtlk.text = $"User {targetSessionState.details.name} is now pinned!";

                SessionManager.SendToRoomID(targetSessionState.RoomID, 0, xtlk, EventTypes.MSG_XTALK, 0);
            }

            return true;
        }
    }
}
