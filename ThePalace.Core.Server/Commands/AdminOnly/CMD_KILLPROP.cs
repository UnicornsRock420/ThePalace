using System;
using System.Linq;
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
    public class CMD_KILLPROP : ICommand
    {
        public const string Help = @"-- Remove any and all props the targeted user is wearing from the server.";

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

                foreach (var asset in targetSessionState.details.propSpec)
                {
                    var dbAsset = dbContext.Assets
                        .Where(a => a.AssetId == asset.id)
                        .FirstOrDefault();

                    if (dbAsset != null)
                    {
                        dbContext.Assets.Remove(dbAsset);
                    }
                }

                if (dbContext.HasUnsavedChanges())
                {
                    dbContext.SaveChanges();
                }

                targetSessionState.details.nbrProps = 0;
                targetSessionState.details.propSpec = null;

                SessionManager.SendToRoomID(targetSessionState.RoomID, 0, new MSG_USERPROP
                {
                    nbrProps = 0,
                    propSpec = null,
                }, EventTypes.MSG_USERPROP, (Int32)targetSessionState.UserID);

                xtlk.text = $"{targetSessionState.details.name}'s avatar has been eraised!";

                sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
            }

            return true;
        }
    }
}
