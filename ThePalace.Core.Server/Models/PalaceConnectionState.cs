using System;
using System.Collections.Generic;
using System.Net.Sockets;
using ThePalace.Core.Constants;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Models
{
    public class PalaceConnectionState : IDisposable
    {
        public Dictionary<DateTime, long> floodControl;

        public DateTime? lastPacketReceived;
        public DateTime? lastPacketSent;
        public DateTime? lastActivity;
        public DateTime? lastPinged;
        public int bytesRemaining;
        public int latencyCounter;

        public Socket tcpSocket;
        public byte[] buffer;
        public List<byte> packet;
        public Header header;

        public SessionState sessionState;

        public PalaceConnectionState()
        {
            buffer = new byte[NetworkConstants.PALACE_PACKET_BUFFER_SIZE];
            floodControl = new Dictionary<DateTime, long>();
            packet = new List<byte>();
            lastPacketReceived = null;
            header = new Header();
            lastPacketSent = null;
            lastActivity = null;
            latencyCounter = 0;
            bytesRemaining = 0;
            tcpSocket = null;
        }

        public void Dispose()
        {
            if (floodControl != null)
            {
                floodControl.Clear();
                floodControl = null;
            }
            if (packet != null)
            {
                packet.Clear();
                packet = null;
            }
            buffer = null;
        }
    }
}
