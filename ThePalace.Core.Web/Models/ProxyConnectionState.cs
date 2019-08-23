using System;
using System.Net.Sockets;
using System.Text;
using ThePalace.Core.Constants;

namespace ThePalace.Server.Web.Models
{
    public class ProxyConnectionState
    {
        public DateTime? lastActivity;
        public DateTime? lastPinged;

        public ProxyHeadlessClient client;
        public ProxyHub hub;

        public WebSocket webSocket;
        public string ConnectionID;
        public string ipAddress;
        public Socket tcpSocket;
        public StringBuilder sb;
        public byte[] buffer;

        public ProxyConnectionState()
        {
            buffer = new byte[NetworkConstants.AEPHIX_PACKET_BUFFER_SIZE];
            sb = new StringBuilder();
        }
    }
}
