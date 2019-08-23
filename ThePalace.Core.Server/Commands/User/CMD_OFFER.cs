using System;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Commands
{
    public class CMD_OFFER : ICommand
    {
        public const string Help = @"-- Offer your avatar to someone.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = SessionManager.sessionStates[UserID];
            var targetSessionState = SessionManager.sessionStates[TargetID];

            targetSessionState.extended["OfferBuffer"] = sessionState.details.propSpec;

            var xWhis = new MSG_XWHISPER
            {
                text = $"I'm offering my avatar to you, type `accept to accept it!",
            };

            targetSessionState.Send(xWhis, EventTypes.MSG_XWHISPER, (Int32)UserID);

            return true;
        }
    }
}
