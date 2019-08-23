using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Server.Core;
using ThePalace.Core.Enums;
using ThePalace.Server.Models;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Business
{
    [Description("HTTP")]
    public struct MSG_HTTPSERVER : ISendBusiness, ISendBroadcast
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            if (!string.IsNullOrWhiteSpace(ServerState.mediaUrl))
            {
                var sessionState = ((Message)message).sessionState;
                // Send HTTP Server 'HTTP'
                var outboundPacket = new Protocols.MSG_HTTPSERVER
                {
                    url = ServerState.mediaUrl,
                };

                sessionState.Send(outboundPacket, EventTypes.MSG_HTTPSERVER, 0);
            }
        }

        public void SendToServer(ThePalaceEntities dbContext, object message)
        {
            if (!string.IsNullOrWhiteSpace(ServerState.mediaUrl))
            {
                // Send HTTP Server 'HTTP'
                var outboundPacket = new Protocols.MSG_HTTPSERVER
                {
                    url = ServerState.mediaUrl,
                };

                SessionManager.SendToServer(outboundPacket, EventTypes.MSG_HTTPSERVER, 0);
            }
        }
    }
}
