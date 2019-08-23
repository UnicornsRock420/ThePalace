using System;
using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Core;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("draw")]
    public struct MSG_DRAW : IReceiveBusiness
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

            var inboundPacket = (Protocols.MSG_DRAW)protocol;

            if (ServerState.roomsCache.ContainsKey(sessionState.RoomID))
            {
                var room = ServerState.roomsCache[sessionState.RoomID];

                switch (inboundPacket.command.type)
                {
                    case DrawCmdTypes.DC_Delete:
                        if (room.DrawCommands.Count > 0)
                        {
                            room.DrawCommands.RemoveAt(room.DrawCommands.Count - 1);
                        }

                        break;

                    case DrawCmdTypes.DC_Detonate:
                        if (room.DrawCommands.Count > 0)
                        {
                            room.DrawCommands.Clear();
                        }

                        break;
                    //case DrawCommandTypes.DC_Path:
                    //case DrawCommandTypes.DC_Text:
                    //case DrawCommandTypes.DC_Shape:
                    //case DrawCommandTypes.DC_Ellipse:
                    default:
                        room.DrawCommands.Add(inboundPacket.command);

                        break;
                }

                room.HasUnsavedChanges = true;
            }

            SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_DRAW, (Int32)sessionState.UserID);
        }
    }
}
