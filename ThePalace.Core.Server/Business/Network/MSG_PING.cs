using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("ping")]
    public struct MSG_PING : IReceiveBusiness, ISendBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            sessionState.Send(null, EventTypes.MSG_PONG, (Int32)sessionState.UserID);
        }

        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            sessionState.Send(null, EventTypes.MSG_PING, (Int32)sessionState.UserID);
        }
    }
}
