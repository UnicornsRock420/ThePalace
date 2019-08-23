using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("nprs")]
    public struct MSG_USERNEW : ISendRoomBusiness
    {
        public void SendToRoomID(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var userNew = new Protocols.MSG_USERNEW();
            
            SessionManager.SendToRoomID(sessionState.RoomID, 0, userNew, EventTypes.MSG_USERNEW, (int)sessionState.UserID);
        }
    }
}
