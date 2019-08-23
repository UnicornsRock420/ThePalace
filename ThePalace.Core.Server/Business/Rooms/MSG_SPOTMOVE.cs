using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Core;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("coLs")]
    public struct MSG_SPOTMOVE : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;

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

            if (sessionState.Authorized)
            {
                var inboundPacket = (Protocols.MSG_SPOTMOVE)protocol;

                if (ServerState.roomsCache.ContainsKey(sessionState.RoomID))
                {
                    var room = ServerState.roomsCache[sessionState.RoomID];

                    foreach (var spot in room.Hotspots)
                    {
                        if (spot.id == inboundPacket.spotID)
                        {
                            spot.loc = inboundPacket.pos;

                            break;
                        }
                    }

                    room.hasUnsavedAuthorChanges = true;
                    room.HasUnsavedChanges = true;

                    SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_SPOTMOVE, 0);
                }
            }
            else
            {
                var xtlk = new Protocols.MSG_XTALK
                {
                    text = "Sorry, this is an Admin only feature.",
                };

                sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
            }
        }
    }
}
