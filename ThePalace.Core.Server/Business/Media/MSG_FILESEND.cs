using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("sFil")]
    public struct MSG_FILESEND : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var mediaState = ((Message)message).mediaState;

            sessionState.Send(mediaState.mediaStream, EventTypes.MSG_FILESEND, 0);
        }
    }
}
