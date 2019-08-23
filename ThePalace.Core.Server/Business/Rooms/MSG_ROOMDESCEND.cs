using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("endr")]
    public struct MSG_ROOMDESCEND : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            // Send User Log 'endr'
            sessionState.Send(null, EventTypes.MSG_ROOMDESCEND, (Int32)sessionState.UserID);
        }
    }
}
