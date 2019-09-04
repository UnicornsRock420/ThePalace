using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("rLst")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_LISTOFALLROOMS : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var listOfAllRooms = new Protocols.MSG_LISTOFALLROOMS();

            sessionState.Send(listOfAllRooms, EventTypes.MSG_LISTOFALLROOMS, 0);
        }
    }
}
