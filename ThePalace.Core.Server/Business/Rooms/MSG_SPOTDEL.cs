using System.ComponentModel;
using System.Linq;
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
    [Description("opSd")]
    [AdminOnlyProtocol]
    [SuccessfullyConnectedProtocol]
    public struct MSG_SPOTDEL : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_SPOTDEL)protocol;
            var room = dbContext.GetRoom(sessionState.RoomID);

            if (!room.NotFound)
            {
                room.Hotspots = room.Hotspots
                    .Where(m => m.id != inboundPacket.spotID)
                    .ToList();

                room.HasUnsavedAuthorChanges = true;
                room.HasUnsavedChanges = true;

                ServerState.FlushRooms(dbContext);

                SessionManager.SendToRoomID(sessionState.RoomID, 0, room, EventTypes.MSG_ROOMSETDESC, 0);
            }
        }
    }
}
