using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("uLst")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_LISTOFALLUSERS : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var listOfAllUsers = new Protocols.MSG_LISTOFALLUSERS();

            sessionState.Send(listOfAllUsers, EventTypes.MSG_LISTOFALLUSERS, 0);
        }
    }
}
