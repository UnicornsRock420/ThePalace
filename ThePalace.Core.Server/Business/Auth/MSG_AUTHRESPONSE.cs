using System.Collections.Generic;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Authorization;
using ThePalace.Server.Models;

namespace ThePalace.Server.Business
{
    [Description("autr")]
    public struct MSG_AUTHRESPONSE : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            AuthEngine.AuthorizeUser(dbContext, message, out int AuthUserID, out List<int> AuthRoleIDs, out List<int> AuthMsgIDs, out List<string> AuthCmds);

            //sessionState = SessionManager.sessionStates[sessionState.UserID];
            sessionState.Authorized = (AuthUserID != 0);
            sessionState.AuthUserID = AuthUserID;
            sessionState.AuthRoleIDs = AuthRoleIDs;
            sessionState.AuthMsgIDs = AuthMsgIDs;
            sessionState.AuthCmds = AuthCmds;

            if (sessionState.Authorized)
            {
                new MSG_LOGON().Send(dbContext, message);
            }
            else
            {
                new MSG_SERVERDOWN
                {
                    reason = ServerDownFlags.SD_LoggedOff,
                    whyMessage = "Authentication Failure!",
                }.Send(dbContext, message);
            }
        }
    }
}
