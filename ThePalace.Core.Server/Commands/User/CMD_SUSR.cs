using System;
using System.Collections.Generic;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Authorization;
using ThePalace.Server.Models;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Commands
{
    public class CMD_SUSR : ICommand
    {
        public const string Help = @"Authorized user escalation.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            if (args.Length > 0)
            {
                Logger.Log(MessageTypes.Info, $"CMD_SUSR[{UserID}]: {args[0]}");
            }

            var sessionState = SessionManager.sessionStates[UserID];

            AuthEngine.AuthorizeUser(dbContext, new Message
            {
                sessionState = sessionState,
                protocol = new MSG_SUPERUSER
                {
                    password = args.FirstOrDefault(),
                },
            }, out int AuthUserID, out List<int> AuthRoleIDs, out List<int> AuthMsgIDs, out List<string> AuthCmds);

            sessionState.Authorized = (AuthUserID != 0);
            sessionState.AuthUserID = AuthUserID;
            sessionState.AuthRoleIDs = AuthRoleIDs;
            sessionState.AuthMsgIDs = AuthMsgIDs;
            sessionState.AuthCmds = AuthCmds;

            return true;
        }
    }
}
