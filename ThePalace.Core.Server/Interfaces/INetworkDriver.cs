using System;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;

namespace ThePalace.Server.Interfaces
{
    public interface INetworkDriver
    {
        void Send(SessionState sessionState, ISendProtocol sendProtocol, EventTypes eventType, Int32 refNum);

        string GetIPAddress();

        bool IsConnected();

        void DropConnection();
    }
}
