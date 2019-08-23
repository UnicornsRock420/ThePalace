using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("auth")]
    public struct MSG_AUTHENTICATE : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            sessionState.Send(null, EventTypes.MSG_AUTHENTICATE, (Int32)sessionState.UserID);
        }
    }
}
