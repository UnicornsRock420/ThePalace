using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Core;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("sRom")]
    [AdminOnlyProtocol]
    [SuccessfullyConnectedProtocol]
    public struct MSG_ROOMSETDESC : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_ROOMSETDESC)protocol;
            var room = dbContext.GetRoom(sessionState.RoomID);

            if (!room.NotFound)
            {
                if (room.ID != inboundPacket.room.ID)
                {
                    inboundPacket.room.ID = room.ID;
                }

                ServerState.roomsCache[room.ID] = inboundPacket.room;
            }

            SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket.room, EventTypes.MSG_ROOMSETDESC, 0);
        }
    }
}
