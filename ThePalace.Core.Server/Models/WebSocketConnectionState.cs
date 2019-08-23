using System;
using System.Collections.Generic;
using ThePalace.Core.Server.Network.Sockets;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Models
{
    public class WebSocketConnectionState : IDisposable
    {
        public Dictionary<DateTime, long> floodControl;

        public DateTime? lastPacketReceived;
        public DateTime? lastPacketSent;
        public DateTime? lastActivity;
        public DateTime? lastPinged;

        public WebSocketHub webSocket;
        public string connectionID;
        public string ipAddress;
        public Header header;

        public SessionState sessionState;

        public WebSocketConnectionState()
        {
            floodControl = new Dictionary<DateTime, long>();
            lastPacketReceived = null;
            header = new Header();
            lastPacketSent = null;
            lastActivity = null;
            webSocket = null;
            ipAddress = null;
        }

        public void Dispose()
        {
            floodControl.Clear();
            floodControl = null;
        }
    }
}
