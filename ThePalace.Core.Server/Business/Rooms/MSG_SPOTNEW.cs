﻿using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Server.Core;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("opSn")]
    [AdminOnlyProtocol]
    [SuccessfullyConnectedProtocol]
    public struct MSG_SPOTNEW : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var room = dbContext.GetRoom(sessionState.RoomID);

            if (!room.NotFound)
            {
                var hq = (short)(room.Width / 4);
                var vq = (short)(room.Height / 4);

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
                room.HasUnsavedAuthorChanges = true;
                room.HasUnsavedChanges = true;

                ServerState.FlushRooms(dbContext);

                SessionManager.SendToRoomID(sessionState.RoomID, 0, room, EventTypes.MSG_ROOMSETDESC, 0);
            }
        }
    }
}
