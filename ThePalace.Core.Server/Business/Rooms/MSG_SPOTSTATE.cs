using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Server.Core;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("sSta")]
    public struct MSG_SPOTSTATE : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;

            if (!sessionState.successfullyConnected)
            {
                new MSG_SERVERDOWN
                {
                    reason = ServerDownFlags.SD_CommError,
                    whyMessage = "Communication Error!",
                }.Send(dbContext, message);

                sessionState.driver.DropConnection();

                return;
            }

            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_SPOTSTATE)protocol;

            if (sessionState.RoomID == inboundPacket.roomID)
            {
                var room = dbContext.GetRoom(sessionState.RoomID);

                if (!room.NotFound)
                {
                    var spot = (HotspotRec)null;

                    for (var j = 0; j < room.Hotspots.Count; j++)
                    {
                        if (room.Hotspots[j].id == inboundPacket.spotID)
                        {
                            spot = room.Hotspots[j];

                            break;
                        }
                    }

                    if (spot != null)
                    {
                        spot.state = inboundPacket.state;
                        room.HasUnsavedAuthorChanges = true;
                        room.HasUnsavedChanges = true;

                        ServerState.FlushRooms(dbContext);

                        SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_SPOTSTATE, 0);
                    }
                }
            }
        }
    }
}
