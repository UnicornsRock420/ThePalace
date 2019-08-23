using System;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Core;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Commands
{
    [AdminOnlyCommand]
    public class CMD_SHUTDOWN : ICommand
    {
        public const string Help = @"-- Shut down the server.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var xtlk = new MSG_XTALK();

            xtlk.text = "Initiating server shutdown...";

            if (UserID == 0xFFFFFFFF)
            {
                Logger.ConsoleLog(xtlk.text);
            }

            SessionManager.SendToStaff(xtlk, EventTypes.MSG_XTALK, 0);

            ServerState.Shutdown();

            return true;
        }
    }
}
