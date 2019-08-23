using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("uLoc")]
    public struct MSG_USERMOVE : IReceiveBusiness
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

            var inboundPacket = (Protocols.MSG_USERMOVE)protocol;
            var room = dbContext.GetRoom(sessionState.RoomID);

            if (!room.NotFound)
            {
                if (inboundPacket.pos.h < 0 || inboundPacket.pos.v < 0)
                {
                    inboundPacket.pos = sessionState.details.roomPos;

                    SessionManager.Send(sessionState, inboundPacket, EventTypes.MSG_USERMOVE, (Int32)sessionState.UserID);

                    return;
                }
                else if (inboundPacket.pos.h > room.Width || inboundPacket.pos.v > room.Height)
                {
                    inboundPacket.pos = sessionState.details.roomPos;

                    SessionManager.Send(sessionState, inboundPacket, EventTypes.MSG_USERMOVE, (Int32)sessionState.UserID);

                    return;
                }

                if (!sessionState.Authorized)
                {
                    if ((sessionState.userFlags & (int)UserFlags.U_Pin) != 0)
                    {
                        inboundPacket.pos = sessionState.details.roomPos;

                        SessionManager.Send(sessionState, inboundPacket, EventTypes.MSG_USERMOVE, (Int32)sessionState.UserID);

                        return;
                    }

                    var spots = room.Hotspots
                        .Where(s => (s.flags & (int)(HotspotFlags.HS_Forbidden | HotspotFlags.HS_Mandatory)) != 0)
                        .ToList();

                    if (spots.Any())
                    {
                        var valid = (bool?)null;

                        foreach (var spot in spots)
                        {
                            var vortexes = new List<Point>();

                            foreach (var vortex in spot.Vortexes)
                            {
                                vortexes.Add(new Point
                                {
                                    h = (Int16)(spot.loc.h + vortex.h),
                                    v = (Int16)(spot.loc.v + vortex.v),
                                });
                            }

                            if (vortexes.PointInPolygon(inboundPacket.pos))
                            {
                                if ((spot.flags & (int)HotspotFlags.HS_Mandatory) != 0)
                                {
                                    valid = true;

                                    break;
                                }
                                else if ((spot.flags & (int)HotspotFlags.HS_Forbidden) != 0)
                                {
                                    valid = false;

                                    break;
                                }
                            }
                            else if ((spot.flags & (int)HotspotFlags.HS_Mandatory) != 0 && !valid.HasValue)
                            {
                                valid = false;
                            }
                        }

                        if (valid.HasValue && valid.Value == false)
                        {
                            inboundPacket.pos = sessionState.details.roomPos;

                            SessionManager.Send(sessionState, inboundPacket, EventTypes.MSG_USERMOVE, (Int32)sessionState.UserID);

                            return;
                        }
                    }
                }

                sessionState.details.roomPos = inboundPacket.pos;

                SessionManager.SendToRoomID(sessionState.RoomID, sessionState.UserID, inboundPacket, EventTypes.MSG_USERMOVE, (Int32)sessionState.UserID);
            }
        }
    }
}
