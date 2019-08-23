using System.Collections.Generic;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Authorization;
using ThePalace.Server.Models;

namespace ThePalace.Server.Business
{
    [Description("susr")]
    public struct MSG_SUPERUSER : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;

            if (!sessionState.successfullyConnected)
            {
                new MSG_SERVERDOWN
                {
                    reason = ServerDownFlags.SD_CommError,
                    whyMessage = "Communication Error!",
                }.Send(dbContext, message);

                sessionState.driver.DropConnection();

                return;
            }

            var packet = (Protocols.MSG_SUPERUSER)protocol;

            Logger.Log(MessageTypes.Info, $"MSG_SUPERUSER[{sessionState.UserID}]: {packet.password}");

            AuthEngine.AuthorizeUser(dbContext, message, out int AuthUserID, out List<int> AuthRoleIDs, out List<int> AuthMsgIDs, out List<string> AuthCmds);

            //sessionState = SessionManager.sessionStates[sessionState.UserID];
            sessionState.Authorized = (AuthUserID != 0);
            sessionState.AuthUserID = AuthUserID;
            sessionState.AuthRoleIDs = AuthRoleIDs;
            sessionState.AuthMsgIDs = AuthMsgIDs;
            sessionState.AuthCmds = AuthCmds;
        }
    }
}
