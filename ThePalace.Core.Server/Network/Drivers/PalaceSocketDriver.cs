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
    public class PalaceSocketDriver : INetworkDriver
    {
        public PalaceConnectionState connectionState;

        public void Send(SessionState sessionState, ISendProtocol sendProtocol, EventTypes eventType, Int32 refNum)
        {
            if (sendProtocol != null)
            {
                var header = new Header
                {
                    eventType = eventType.ToString(),
                    refNum = refNum,
                };
                var data = new byte[0];

                try
                {
                    data = sendProtocol.Serialize(new Message
                    {
                        sessionState = sessionState,
                        header = header,
                    });
                }
                catch (Exception ex)
                {
                    ex.Log();
                }

                header.length = (UInt32)(data == null ? 0 : data.Length);

                switch (eventType)
                {
                    case EventTypes.MSG_LISTOFALLROOMS:
                        header.refNum = (Int32)((MSG_LISTOFALLROOMS)sendProtocol).nbrRooms;

                        break;
                    case EventTypes.MSG_LISTOFALLUSERS:
                        header.refNum = (Int32)((MSG_LISTOFALLUSERS)sendProtocol).nbrUsers;

                        break;
                }

                PalaceAsyncSocket.Send(sessionState, header.Serialize(data));
            }
            else
            {
                var header = new Header
                {
                    eventType = eventType.ToString(),
                    length = (UInt32)0,
                    refNum = refNum,
                };

                PalaceAsyncSocket.Send(sessionState, header.Serialize());
            }
        }

        public string GetIPAddress()
        {
            return connectionState.tcpSocket.GetIPAddress();
        }

        public bool IsConnected()
        {
            return connectionState.IsConnected();
        }

        public void DropConnection()
        {
            connectionState.tcpSocket.DropConnection();
        }
    }
}
