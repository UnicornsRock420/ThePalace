using System.Collections.Generic;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Authorization;
using ThePalace.Server.Models;

namespace ThePalace.Server.Business
{
    [Description("susr")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_SUPERUSER : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_SUPERUSER)protocol;

            Logger.Log(MessageTypes.Info, $"MSG_SUPERUSER[{sessionState.UserID}]: {inboundPacket.password}");

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
