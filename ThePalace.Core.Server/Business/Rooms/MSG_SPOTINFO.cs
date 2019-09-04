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
    [Description("ofNs")]
    [AdminOnlyProtocol]
    [SuccessfullyConnectedProtocol]
    public struct MSG_SPOTINFO : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_SPOTINFO)protocol;

            if (sessionState.RoomID == inboundPacket.roomID)
            {
                var room = dbContext.GetRoom(sessionState.RoomID);

                if (!room.NotFound)
                {
                    foreach (var spot in room.Hotspots)
                    {
                        if (spot.id == inboundPacket.spot.id)
                        {
                            spot.name = inboundPacket.spot.name;
                            spot.type = inboundPacket.spot.type;
                            spot.state = inboundPacket.spot.state;
                            spot.states = inboundPacket.spot.states;
                            spot.script = inboundPacket.spot.script;
                            spot.dest = inboundPacket.spot.dest;
                            spot.flags = inboundPacket.spot.flags;
                            spot.Vortexes = inboundPacket.spot.Vortexes;

                            if (inboundPacket.pictureList != null)
                            {
                                room.Pictures = inboundPacket.pictureList;
                            }

                            break;
                        }
                    }

                    room.HasUnsavedAuthorChanges = true;
                    room.HasUnsavedChanges = true;

                    ServerState.FlushRooms(dbContext);

                    SessionManager.SendToRoomID(sessionState.RoomID, sessionState.UserID, room, EventTypes.MSG_ROOMSETDESC, 0);
                }
            }
        }
    }
}
