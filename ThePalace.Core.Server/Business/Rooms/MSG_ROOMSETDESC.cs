using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Server.Core;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("sRom")]
    public struct MSG_ROOMSETDESC : IReceiveBusiness
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

            var inboundPacket = (Protocols.MSG_ROOMSETDESC)protocol;
            if (ServerState.roomsCache.ContainsKey(sessionState.RoomID))
            {
                var room = ServerState.roomsCache[sessionState.RoomID];
                if (room.ID != inboundPacket.room.ID)
                {
                    inboundPacket.room.ID = room.ID;
                }
                ServerState.roomsCache[sessionState.RoomID] = inboundPacket.room;
            }

            SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket.room, EventTypes.MSG_ROOMSETDESC, 0);
        }
    }
}
