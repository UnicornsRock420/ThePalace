using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("tiyr")]
    public struct MSG_TIYID : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var tiyid = new Protocols.MSG_TIYID
            {
                ipAddress = sessionState.driver.GetIPAddress(),
            };

            sessionState.Send(tiyid, EventTypes.MSG_TIYID, (Int32)sessionState.UserID);
        }
    }
}
