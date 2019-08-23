using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("sErr")]
    public struct MSG_NAVERROR : ISendBusiness
    {
        public NavErrors reason;

        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            sessionState.Send(null, EventTypes.MSG_NAVERROR, (Int32)reason);
        }
    }
}
