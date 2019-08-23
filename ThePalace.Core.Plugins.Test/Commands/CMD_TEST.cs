using System;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Plugins.Commands
{
    public class CMD_TEST : ICommand
    {
        public const string Help = @"-- Example: Hello World!";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            //var sessionState = UserID != 0xFFFFFFFF ? SessionManager.sessionStates[UserID] : null;

            if (UserID == 0xFFFFFFFF)
            {
                Logger.ConsoleLog("Example: Hello World!");
            }
            else
            {
                var xtalk = new MSG_XTALK
                {
                    text = "Example: Hello World!",
                };
                SessionManager.SendToUserID(UserID, xtalk, EventTypes.MSG_XTALK, 0);
            }

            return true;
        }
    }
}
