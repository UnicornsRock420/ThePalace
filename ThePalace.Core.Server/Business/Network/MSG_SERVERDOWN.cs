using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("down")]
    public struct MSG_SERVERDOWN : ISendBusiness, ISendBroadcast
    {
        public ServerDownFlags reason;
        public string whyMessage;

        public void Send(ThePalaceEntities dbConetxt, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var serverDown = new Protocols.MSG_SERVERDOWN
            {
                whyMessage = whyMessage,
            };

            sessionState.Send(serverDown, EventTypes.MSG_SERVERDOWN, (Int32)reason);
        }

        public void SendToServer(ThePalaceEntities dbConetxt, object message)
        {
            var serverDown = new Protocols.MSG_SERVERDOWN
            {
                whyMessage = whyMessage,
            };

            SessionManager.SendToServer(serverDown, EventTypes.MSG_SERVERDOWN, (Int32)reason);
        }
    }
}
