using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("ryit")]
    public struct MSG_DIYIT : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var diyit = new Protocols.MSG_DIYIT
            {
                ipAddress = sessionState.driver.GetIPAddress(),
            };

            sessionState.Send(diyit, EventTypes.MSG_DIYIT, (Int32)sessionState.UserID);
        }
    }
}
