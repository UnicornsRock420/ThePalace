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
    public class CMD_ROOMMAXOCC : ICommand
    {
        public const string Help = @"[<n>|default] -- Control the maximum occupancy limit for the current room.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = SessionManager.sessionStates[UserID];
            var xtlk = new MSG_XTALK();

            if (args.Length > 0)
            {
                ServerState.roomsCache[sessionState.RoomID].MaxOccupancy = args[0].TryParse<short>(0).Value;
            }

            xtlk.text = $"The room's maximum occupancy is currently: {ServerState.roomsCache[sessionState.RoomID].MaxOccupancy}";

            sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);

            return true;
        }
    }
}
