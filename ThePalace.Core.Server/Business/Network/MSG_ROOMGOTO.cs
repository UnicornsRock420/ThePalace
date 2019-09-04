using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("navR")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_ROOMGOTO : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;

            if (!sessionState.Authorized)
            {
                if ((sessionState.userFlags & (int)UserFlags.U_Pin) != 0)
                {
                    return;
                }
            }

            var maxRoomOccupancy = ConfigManager.GetValue<int>("MaxRoomOccupancy", 45);
            var inboundPacket = (Protocols.MSG_ROOMGOTO)protocol;
            var destRoom = dbContext.GetRoom(inboundPacket.dest);

            if (destRoom.NotFound)
            {
                new MSG_NAVERROR
                {
                    reason = NavErrors.SE_RoomUnknown,
                }.Send(dbContext, message);

                return;
            }
            else if (!sessionState.Authorized)
            {
                var destRoomUserCount = SessionManager.GetRoomUserCount(inboundPacket.dest);

                if ((destRoom.Flags & (int)RoomFlags.RF_WizardsOnly) != 0 || (destRoom.Flags & (int)RoomFlags.RF_Closed) != 0)
                {
                    new MSG_NAVERROR
                    {
                        reason = NavErrors.SE_RoomClosed,
                    }.Send(dbContext, message);

                    return;
                }
                else if ((destRoom.MaxOccupancy > 0 && destRoomUserCount >= destRoom.MaxOccupancy) || (destRoom.MaxOccupancy == 0 && destRoomUserCount >= maxRoomOccupancy))
                {
                    new MSG_NAVERROR
                    {
                        reason = NavErrors.SE_RoomFull,
                    }.Send(dbContext, message);

                    return;
                }
            }

            var nbrUsers = SessionManager.GetRoomUserCount(sessionState.RoomID, sessionState.UserID);
            var currentRoom = dbContext.GetRoom(sessionState.RoomID);

            if (nbrUsers > 0)
            {
                new MSG_USEREXIT().SendToRoomID(dbContext, message);
            }
            else if (!currentRoom.NotFound)
            {
                currentRoom.Flags &= ~(int)RoomFlags.RF_Closed;
            }

            sessionState.RoomID = inboundPacket.dest;

            if (!sessionState.Authorized)
            {
                var spots = destRoom.Hotspots
                    .Where(s => (s.flags & (int)(HotspotFlags.HS_LandingPad)) != 0)
                    .ToList();
                if (spots.Any())
                {
                    var offset = (Int32)RndGenerator.NextSecure((UInt32)spots.Count);
                    var vortexes = new List<Point>();
                    var spot = spots
                        .Skip(offset)
                        .Take(1)
                        .FirstOrDefault();
                    var minH = (Int16)(spot.loc.h + spot.Vortexes[0].h);
                    var maxH = (Int16)(spot.loc.h + spot.Vortexes[0].h);
                    var minV = (Int16)(spot.loc.v + spot.Vortexes[0].v);
                    var maxV = (Int16)(spot.loc.v + spot.Vortexes[0].v);

                    foreach (var vortex in spot.Vortexes)
                    {
                        var p = new Point
                        {
                            h = (Int16)(spot.loc.h + vortex.h),
                            v = (Int16)(spot.loc.v + vortex.v),
                        };

                        vortexes.Add(p);

                        if (p.h < minH) minH = p.h;
                        if (p.h > maxH) maxH = p.h;
                        if (p.v < minV) minV = p.v;
                        if (p.v > maxV) maxV = p.v;
                    }

                    do
                    {
                        sessionState.details.roomPos.h = (Int16)RndGenerator.NextSecure((UInt32)minH, (UInt32)maxH);
                        sessionState.details.roomPos.v = (Int16)RndGenerator.NextSecure((UInt32)minV, (UInt32)maxV);

                        if (vortexes.PointInPolygon(sessionState.details.roomPos))
                        {
                            break;
                        }
                    } while (true);
                }
                else
                {
                    sessionState.details.roomPos.h = (Int16)RndGenerator.NextSecure((UInt32)destRoom.Width);
                    sessionState.details.roomPos.v = (Int16)RndGenerator.NextSecure((UInt32)destRoom.Height);
                }
            }
            else
            {
                sessionState.details.roomPos.h = (Int16)RndGenerator.NextSecure((UInt32)destRoom.Width);
                sessionState.details.roomPos.v = (Int16)RndGenerator.NextSecure((UInt32)destRoom.Height);
            }

            var sendBusinesses = new List<ISendBusiness>
            {
                new MSG_ROOMDESC(),
                new MSG_USERLIST(),
                new MSG_ROOMDESCEND(),
            };

            foreach (var sendBusiness in sendBusinesses)
            {
                sendBusiness.Send(dbContext, message);
            }

            new MSG_USERNEW().SendToRoomID(dbContext, message);
        }
    }
}
