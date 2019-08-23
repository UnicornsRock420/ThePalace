using System;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Commands
{
    [AdminOnlyCommand]
    public class CMD_MAXOCC : ICommand
    {
        public const string Help = @"[<n>|default] -- Control the maximum occupancy limit for the current room.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = SessionManager.sessionStates[UserID];
            var maxOccupany = (UInt32)0;
            var xtlk = new MSG_XTALK();

            if (args.Length > 0)
            {
                ConfigManager.SetValue("MaxOccupany", args[0].TryParse<short>(0).Value.ToString());
            }

            maxOccupany = ConfigManager.GetValue<UInt32>("MaxOccupany", 100).Value;

            xtlk.text = $"The server's maximum occupancy is currently: {maxOccupany}";

            sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);

            return true;
        }
    }
}
