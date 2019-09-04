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
    [Description("coLs")]
    [AdminOnlyProtocol]
    [SuccessfullyConnectedProtocol]
    public struct MSG_SPOTMOVE : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_SPOTMOVE)protocol;

            if (sessionState.RoomID == inboundPacket.roomID)
            {
                var room = dbContext.GetRoom(sessionState.RoomID);

                if (!room.NotFound)
                {
                    foreach (var spot in room.Hotspots)
                    {
                        if (spot.id == inboundPacket.spotID)
                        {
                            spot.loc = inboundPacket.pos;

                            break;
                        }
                    }

                    room.HasUnsavedAuthorChanges = true;
                    room.HasUnsavedChanges = true;

                    ServerState.FlushRooms(dbContext);

                    SessionManager.SendToRoomID(sessionState.RoomID, sessionState.UserID, inboundPacket, EventTypes.MSG_SPOTMOVE, 0);
                }
            }
        }
    }
}
