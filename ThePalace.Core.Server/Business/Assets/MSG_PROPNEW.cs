using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Server.Core;
using ThePalace.Server.Factories;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("prPn")]
    public struct MSG_PROPNEW : IReceiveBusiness
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

            var room = dbContext.GetRoom(sessionState.RoomID);
            var inboundPacket = (Protocols.MSG_PROPNEW)protocol;

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

                room.LooseProps.Add(new LoosePropRec
                {
                    propSpec = inboundPacket.propSpec,
                    loc = inboundPacket.loc,
                    flags = 0,
                });

                room.HasUnsavedChanges = true;
            }

            AssetLoader.CheckAssets(sessionState, inboundPacket.propSpec);

            SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_PROPNEW, 0);
        }
    }

}
