using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text.RegularExpressions;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Authorization;
using ThePalace.Server.Core;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("regi")]
    public struct MSG_LOGON : IReceiveBusiness, ISendBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;

            if (sessionState.successfullyConnected)
            {
                new MSG_SERVERDOWN
                {
                    reason = ServerDownFlags.SD_CommError,
                    whyMessage = "Communication Error!",
                }.Send(dbContext, message);

                sessionState.driver.DropConnection();

                return;
            }

            var serverRequiresAuthentication = ConfigManager.GetValue<bool>("ServerRequiresAuthentication", false, true).Value;
            var inboundPacket = (Protocols.MSG_LOGON)protocol;

            if (!Cipher.ValidUserSerialNumber(inboundPacket.reg.crc, inboundPacket.reg.counter))
            {
                new MSG_SERVERDOWN
                {
                    reason = ServerDownFlags.SD_InvalidSerialNumber,
                    whyMessage = "Invalid Serial Number!",
                }.Send(dbContext, message);

                sessionState.driver.DropConnection();

                return;
            }

            lock (SessionManager.sessionStates)
            {
                foreach (var userState in SessionManager.sessionStates.Values)
                {
                    if (userState.reg != null && userState.UserID != sessionState.UserID && inboundPacket.reg.crc == userState.reg.crc && inboundPacket.reg.counter == userState.reg.counter)
                    {
                        new MSG_SERVERDOWN
                        {
                            reason = ServerDownFlags.SD_DuplicateUser,
                            whyMessage = "Duplicate Serial Number!",
                        }.Send(dbContext, new Message
                        {
                            sessionState = userState,
                        });

                        userState.driver.DropConnection();
                    }
                }
            }

            sessionState.RoomID = 0;

            if (string.IsNullOrWhiteSpace(inboundPacket.reg.userName) || Regex.IsMatch(inboundPacket.reg.userName, @"^User\s*[0-9]+$", RegexOptions.IgnoreCase | RegexOptions.Singleline))
            {
                inboundPacket.reg.userName = $"User {sessionState.UserID}";
            }

            AuthEngine.AuthorizeUser(dbContext, message, out int AuthUserID, out List<int> AuthRoleIDs, out List<int> AuthMsgIDs, out List<string> AuthCmds);

            sessionState.details.name = inboundPacket.reg.userName;
            sessionState.reg = inboundPacket.reg;

            sessionState.Authorized = (AuthUserID != 0);
            sessionState.AuthUserID = AuthUserID;
            sessionState.AuthRoleIDs = AuthRoleIDs;
            sessionState.AuthMsgIDs = AuthMsgIDs;
            sessionState.AuthCmds = AuthCmds;

            Logger.Log(MessageTypes.Info, $"Authorized = {sessionState.Authorized.ToString()}, RegCode = {Cipher.RegRectoSeed(inboundPacket.reg)}, PUID = {Cipher.RegRectoSeed(inboundPacket.reg, true)}");

            var ipAddress = sessionState.driver.GetIPAddress();

            if (!sessionState.Authorized)
            {
                var now = DateTime.UtcNow;
                var bans = dbContext.Bans.AsNoTracking()
                    .AsEnumerable()
                    .Where(b =>
                        (b.Ipaddress == ipAddress ||
                        (b.RegCtr == inboundPacket.reg.counter && b.RegCrc == inboundPacket.reg.crc) ||
                        (b.Puidctr == inboundPacket.reg.puidCtr && b.Puidcrc == inboundPacket.reg.puidCRC)) &&
                        (!b.UntilDate.HasValue || b.UntilDate.Value < now))
                    .Count();

                if (bans > 0)
                {
                    new MSG_SERVERDOWN
                    {
                        reason = ServerDownFlags.SD_Banished,
                        whyMessage = "You have been banned!",
                    }.Send(null, message);

                    sessionState.driver.DropConnection();

                    return;
                }
            }

            if (!sessionState.Authorized && serverRequiresAuthentication)
            {
                new MSG_AUTHENTICATE().Send(dbContext, message);
            }
            else
            {
                Send(dbContext, message);
            }
        }

        public void Send(ThePalaceEntities dbContext, object message)
        {
            var maxRoomOccupancy = ConfigManager.GetValue<int>("MaxRoomOccupancy", 45);
            var sessionState = ((Message)message).sessionState;

            #region Fuzzy logic to find a room

            var fullRoomIDs = new List<Int16>();
            var entryRoomIDKeys = new Int16[0];
            var roomCacheKeys = new Int16[0];
            var roomID = (Int16)0;

            Action findRoom = () =>
            {
                var roomCount = SessionManager.GetRoomUserCount(roomID);

                try
                {
                    if (
                        (entryRoomIDKeys.Contains(roomID) && !roomCacheKeys.Contains(roomID)) ||
                        (roomCacheKeys.Contains(roomID) && ServerState.roomsCache[roomID].MaxOccupancy == 0 && roomCount < maxRoomOccupancy) ||
                        (roomCacheKeys.Contains(roomID) && (ServerState.roomsCache[roomID].MaxOccupancy > 0) && roomCount < ServerState.roomsCache[roomID].MaxOccupancy))
                    {
                        sessionState.RoomID = roomID;

                        return;
                    }
                }
                catch (Exception ex)
                {
                    ex.DebugLog();
                }

                fullRoomIDs.Add(roomID);
            };

            if (sessionState.reg.desiredRoom > 0)
            {
                entryRoomIDKeys = ServerState.entryRoomIDs.ToArray();
                roomCacheKeys = ServerState.roomsCache.Keys.ToArray();

                roomID = sessionState.reg.desiredRoom;

                findRoom();
            }

            while (sessionState.RoomID == 0)
            {
                entryRoomIDKeys = ServerState.entryRoomIDs
                    .Where(r => !fullRoomIDs.Contains(r))
                    .ToArray();
                roomCacheKeys = ServerState.roomsCache.Keys
                    .Where(r => !fullRoomIDs.Contains(r))
                    .ToArray();

                if (entryRoomIDKeys.Length > 0)
                {
                    roomID = entryRoomIDKeys[RndGenerator.NextSecure((uint)entryRoomIDKeys.Length)];

                    findRoom();
                }
                else if (roomCacheKeys.Length > 0)
                {
                    roomID = roomCacheKeys[RndGenerator.NextSecure((uint)roomCacheKeys.Length)];

                    findRoom();
                }
                else
                {
                    sessionState.RoomID = dbContext.Rooms.AsNoTracking()
                        .Where(r => !fullRoomIDs.Contains(r.RoomId))
                        .Select(r => r.RoomId)
                        .FirstOrDefault();

                    if (sessionState.RoomID == 0)
                    {
                        new MSG_SERVERDOWN
                        {
                            reason = ServerDownFlags.SD_ServerFull,
                            whyMessage = "The Server is full!",
                        }.Send(dbContext, message);

                        sessionState.driver.DropConnection();

                        return;
                    }
                }
            }

            #endregion

            sessionState.successfullyConnected = true;

            var sendBusinesses = new List<ISendBusiness>
            {
                new MSG_ALTLOGONREPLY(),
                new MSG_VERSION(),
                new MSG_SERVERINFO(),
                new MSG_USERSTATUS(),
            };

            foreach (var sendBusiness in sendBusinesses)
            {
                sendBusiness.Send(dbContext, message);
            }

            new MSG_USERLOG().SendToServer(dbContext, message);

            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
            {
                try
                {
                    dbContext.Users1.Add(new Users1
                    {
                        UserId = (Int32)sessionState.UserID,
                        Name = sessionState.reg.userName,
                        RoomId = sessionState.RoomID,
                        Flags = sessionState.userFlags,
                    });

                    dbContext.UserData.Add(new UserData
                    {
                        UserId = (Int32)sessionState.UserID,
                        RoomPosH = sessionState.details.roomPos.h,
                        RoomPosV = sessionState.details.roomPos.v,
                        FaceNbr = sessionState.details.faceNbr,
                        ColorNbr = sessionState.details.colorNbr,
                        AwayFlag = 0,
                        OpenToMsgs = 0,
                    });

                    dbContext.SaveChanges();

                    dbContextTransaction.Commit();
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();

                    ex.DebugLog();
                }
            }

            new MSG_HTTPSERVER().Send(dbContext, message);

            new MSG_ROOMGOTO().Receive(dbContext, new Message
            {
                sessionState = sessionState,
                protocol = new Protocols.MSG_ROOMGOTO
                {
                    dest = sessionState.RoomID,
                },
            });
        }
    }
}
