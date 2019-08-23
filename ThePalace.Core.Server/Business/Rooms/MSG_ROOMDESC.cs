using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("room")]
    public struct MSG_ROOMDESC : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            // Send Room 'room'
            var room = dbContext.GetRoom(sessionState.RoomID);
            if (room.NotFound)
            {
                sessionState.Send(null, EventTypes.MSG_NAVERROR, (Int32)NavErrors.SE_RoomUnknown);
            }
            else
            {
                sessionState.Send(room, EventTypes.MSG_ROOMDESC, 0);
            }
        }
    }
}
