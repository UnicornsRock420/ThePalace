using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("mPrp")]
    public struct MSG_PROPMOVE : IReceiveBusiness
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

            var inboundPacket = (Protocols.MSG_PROPMOVE)protocol; ;
            var room = dbContext.GetRoom(sessionState.RoomID);

            if (!room.NotFound)
            {
                if ((room.Flags & (int)RoomFlags.RF_NoLooseProps) != 0)
                {
                    room.LooseProps.Clear();

                    var xtalk = new Protocols.MSG_XTALK
                    {
                        text = "Loose props are disabled in this room.",
                    };

                    SessionManager.Send(sessionState, xtalk, EventTypes.MSG_XTALK, 0);

                    return;
                }

                if (inboundPacket.pos.h < 0 || inboundPacket.pos.v < 0)
                {
                    return;
                }
                else if (inboundPacket.pos.h > room.Width || inboundPacket.pos.v > room.Height)
                {
                    return;
                }
                else if (inboundPacket.propNum >= 0 && inboundPacket.propNum < room.LooseProps.Count)
                {
                    room.LooseProps[inboundPacket.propNum].loc = inboundPacket.pos;
                    room.HasUnsavedChanges = true;

                    SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_PROPMOVE, 0);
                }
            }
        }
    }
}
