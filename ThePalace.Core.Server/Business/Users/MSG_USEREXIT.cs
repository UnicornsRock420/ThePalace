using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("eprs")]
    public struct MSG_USEREXIT : ISendRoomBusiness
    {
        public void SendToRoomID(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            SessionManager.SendToRoomID(sessionState.RoomID, sessionState.UserID, null, EventTypes.MSG_USEREXIT, (Int32)sessionState.UserID);
        }
    }
}
