using System;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Commands
{
    public class CMD_ACCEPT : ICommand
    {
        public const string Help = @"-- Accept someone's offered avatar.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = SessionManager.sessionStates[UserID];

            if (sessionState.extended.ContainsKey("OfferBuffer"))
            {
                var userProp = new MSG_USERPROP
                {
                    propSpec = (AssetSpec[])sessionState.extended["OfferBuffer"],
                };
                userProp.nbrProps = (Int16)userProp.propSpec.Length;

                sessionState.Send(userProp, EventTypes.MSG_USERPROP, (Int32)UserID);
            }
            else
            {
                var xtlk = new MSG_XTALK
                {
                    text = $"No one has offered you their avatar.",
                };

                sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
            }

            return true;
        }
    }
}
