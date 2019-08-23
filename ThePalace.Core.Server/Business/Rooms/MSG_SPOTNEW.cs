using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Server.Core;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("opSn")]
    public struct MSG_SPOTNEW : IReceiveBusiness
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
                if (ServerState.roomsCache.ContainsKey(sessionState.RoomID))
                {
                    var room = ServerState.roomsCache[sessionState.RoomID];
                    var hq = (short)(512 / 4);
                    var vq = (short)(384 / 4);

                    room.Hotspots.Add(new HotspotRec
                    {
                        id = (short)(room.Hotspots.Count > 0 ? (room.Hotspots.Max(h => h.id) + 1) : 1),
                        loc = new Point
                        {
                            h = 0,
                            v = 0,
                        },
                        Vortexes = new List<Point>
                        {
                            new Point
                            {
                                h = (short)(hq * 1),
                                v = (short)(vq * 1),
                            },
                            new Point
                            {
                                h = (short)(hq * 3),
                                v = (short)(vq * 1),
                            },
                            new Point
                            {
                                h = (short)(hq * 3),
                                v = (short)(vq * 3),
                            },
                            new Point
                            {
                                h = (short)(hq * 1),
                                v = (short)(vq * 3),
                            },
                        },
                    });
                    room.hasUnsavedAuthorChanges = true;
                    room.HasUnsavedChanges = true;

                    SessionManager.SendToRoomID(sessionState.RoomID, 0, room, EventTypes.MSG_ROOMSETDESC, 0);

                }
            }
            else
            {
                var xtlk = new Protocols.MSG_XTALK
                {
                    text = "Sorry, this is an Admin only feature.",
                };

                SessionManager.SendToRoomID(sessionState.RoomID, 0, xtlk, EventTypes.MSG_XTALK, 0);
            }
        }
    }
}
