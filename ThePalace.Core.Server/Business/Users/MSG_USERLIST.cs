using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("rprs")]
    public struct MSG_USERLIST : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var userList = new Protocols.MSG_USERLIST();

            sessionState.Send(userList, EventTypes.MSG_USERLIST, (Int32)SessionManager.GetRoomUserCount(sessionState.RoomID, sessionState.UserID));
        }
    }
}
