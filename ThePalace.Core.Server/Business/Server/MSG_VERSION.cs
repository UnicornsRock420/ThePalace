using System.ComponentModel;
using System.Reflection;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;
using ThePalace.Server.Network.Sockets;

namespace ThePalace.Server.Business
{
    [Description("vers")]
    public struct MSG_VERSION : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var version = Assembly.GetExecutingAssembly().GetName().Version;
            // Send Server Version 'vers'

            sessionState.Send(null, EventTypes.MSG_VERSION, (((version.Major & 0xFFFF) << 16) | (version.Minor & 0xFFFF)));
        }
    }
}
