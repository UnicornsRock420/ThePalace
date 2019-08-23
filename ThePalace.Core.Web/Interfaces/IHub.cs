using System;
using ThePalace.Core.Enums;
using ThePalace.Server.Web.Models;

namespace ThePalace.Server.Web.Interfaces
{
    public interface IHub
    {
        void Send(EventTypes eventType, Int32 refNum, string message);

        void Queue(ProxyConnectionState connectionState, string json);
    }
}
