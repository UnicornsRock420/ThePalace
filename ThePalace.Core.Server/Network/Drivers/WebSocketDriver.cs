using Newtonsoft.Json;
using System;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;
using ThePalace.Server.Network.Sockets;
using ThePalace.Server.Protocols;
using ThePalace.Server.Interfaces;

namespace ThePalace.Server.Network.Drivers
{
    public class WebSocketDriver : INetworkDriver
    {
        public WebSocketConnectionState connectionState;

        public void Send(SessionState sessionState, ISendProtocol sendProtocol, EventTypes eventType, Int32 refNum)
        {
            var header = new Header
            {
                eventType = eventType.ToString(),
                refNum = refNum,
            };
            try
            {
                header.message = sendProtocol?.SerializeJSON(new Message
                {
                    sessionState = sessionState,
                    header = header,
                });
            }
            catch (Exception ex)
            {
                ex.Log();
            }
            var json = JsonConvert.SerializeObject(new object[] {
                header.eventType.ToString(),
                header.refNum,
                header.message,
            });

            WebAsyncSocket.Send(sessionState, connectionState, json);
        }

        public string GetIPAddress()
        {
            return connectionState.ipAddress;
        }

        public bool IsConnected()
        {
            return WebAsyncSocket.IsConnected(connectionState);
        }

        public void DropConnection()
        {
            WebAsyncSocket.DropConnection(connectionState);
        }
    }
}
