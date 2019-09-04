using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("fnfe")]
    public struct MSG_FILENOTFND : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_FILEQUERY)protocol;
            var fileNotFound = new Protocols.MSG_FILENOTFND
            {
                fileName = inboundPacket.fileName,
            };

            sessionState.Send(fileNotFound, EventTypes.MSG_FILENOTFND, (Int32)sessionState.UserID);
        }
    }
}
