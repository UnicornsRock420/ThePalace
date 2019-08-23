using Microsoft.EntityFrameworkCore;
using System.ComponentModel;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Core;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("unlo")]
    public struct MSG_DOORUNLOCK : IReceiveBusiness
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

            var inboundPacket = (Protocols.MSG_DOORUNLOCK)protocol;

            if (inboundPacket.roomID == sessionState.RoomID)
            {
                var hotspotType = dbContext.Hotspots.AsNoTracking()
                    .Where(h => h.RoomId == inboundPacket.roomID)
                    .Where(h => h.HotspotId == inboundPacket.spotID)
                    .Select(h => h.Type)
                    .FirstOrDefault();

                if (hotspotType == (short)HotspotTypes.HS_Bolt)
                {
                    if (ServerState.roomsCache.ContainsKey(sessionState.RoomID))
                    {
                        ServerState.roomsCache[sessionState.RoomID].Flags &= (~(int)RoomFlags.RF_Closed);
                    }

                    SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_DOORUNLOCK, 0);
                }
                else
                {
                    var outboundPacket = new Protocols.MSG_XTALK
                    {
                        text = "The door you are attempting to unlock is not a deadbolt!",
                    };

                    sessionState.Send(outboundPacket, EventTypes.MSG_XTALK, 0);
                }
            }
        }
    }
}
