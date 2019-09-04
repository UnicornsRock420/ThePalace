using System;
using System.ComponentModel;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("unlo")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_DOORUNLOCK : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_DOORUNLOCK)protocol;

            if (inboundPacket.roomID == sessionState.RoomID)
            {
                var room = dbContext.GetRoom(sessionState.RoomID);

                if (!room.NotFound)
                {
                    var hotspotType = room.Hotspots
                        .Where(s => s.id == inboundPacket.spotID)
                        .Select(s => (short)s.type)
                        .FirstOrDefault();

                    if (hotspotType == (short)HotspotTypes.HS_Bolt)
                    {
                        room.Flags &= (~(int)RoomFlags.RF_Closed);

                        SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_DOORUNLOCK, (Int32)sessionState.UserID);
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
}
