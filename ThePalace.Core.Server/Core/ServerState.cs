using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Factories;
using ThePalace.Server.Network;
using ThePalace.Server.Network.Sockets;

namespace ThePalace.Server.Core
{
    public static class ServerState
    {
        private static readonly Type receiveProtocol = typeof(IReceiveProtocol);
        public static volatile ConcurrentDictionary<Int16, RoomBuilder> roomsCache = new ConcurrentDictionary<Int16, RoomBuilder>();
        public static volatile UInt32 lastIssuedUserID = 0;
        public static volatile bool isShutDown = false;

        public static volatile Int32 serverPermissions = (int)(ServerPermissions.PM_AllowCyborgs | ServerPermissions.PM_AllowGuests | ServerPermissions.PM_AllowPainting | ServerPermissions.PM_AllowWizards | ServerPermissions.PM_WizardsMayKill | ServerPermissions.PM_WizardsMayAuthor);
        public static volatile List<Int16> entryRoomIDs = new List<Int16>();
        public static volatile string serverName = string.Empty;
        private static DateTime? _lastCycleDate = null;
        public static volatile string mediaUrl = null;
        public static volatile UInt32 maxOccupancy = 0;
        public static volatile UInt32 nbrRooms = 0;

        public static void Init()
        {
            Cipher.InitTable();

            using (var dbContext = Database.For<ThePalaceEntities>())
            {
                try
                {
                    dbContext.Users1.Clear();
                    dbContext.UserData.Clear();
                    dbContext.Assets1.Clear();

                    dbContext.Rooms
                        .Where(r => (r.Flags & (int)RoomFlags.RF_Closed) != 0)
                        .ToList()
                        .ForEach(r =>
                        {
                            r.Flags &= ~(int)RoomFlags.RF_Closed;
                        });

                    if (dbContext.HasUnsavedChanges())
                    {
                        dbContext.SaveChanges();
                    }
                }
                catch (Exception ex)
                {
                    ex.DebugLog();
                }
            }

            PluginManager.Init();
            SessionManager.Init();
            ThreadController.Init();
        }

        public static void FlushRooms(ThePalaceEntities dbContext)
        {
            roomsCache.Values
                .ToList()
                .ForEach(r =>
                {
                    var nbrUsers = SessionManager.GetRoomUserCount(r.ID);

                    if (r.HasUnsavedChanges)
                    {
                        if (nbrUsers < 1 && (r.Flags & (int)RoomFlags.RF_Closed) != 0)
                        {
                            r.Flags &= ~(int)RoomFlags.RF_Closed;
                        }

                        r.Write(dbContext);
                    }

                    if (nbrUsers < 1 && (r.Flags & (int)RoomFlags.RF_DropZone) == 0)
                    {
                        lock (roomsCache)
                        {
                            roomsCache.Remove(r.ID);
                        }
                    }
                });
        }

        public static void RefreshSettings()
        {
            var _serverName = ConfigManager.GetValue("ServerName", string.Empty, true);
            var _mediaUrl = ConfigManager.GetValue("MediaUrl", string.Empty, true);

            using (var dbContext = Database.For<ThePalaceEntities>())
            {
                dbContext.Database.ExecuteSqlCommand("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED");

                if (!isShutDown)
                {
                    try
                    {
                        nbrRooms = (UInt32)dbContext.Rooms.AsNoTracking().Count();

                        entryRoomIDs = dbContext.Rooms.AsNoTracking()
                            .Where(r => (r.Flags & (int)RoomFlags.RF_DropZone) != 0)
                            .Select(r => r.RoomId)
                            .ToList();
                    }
                    catch (Exception ex)
                    {
                        ex.DebugLog();
                    }

                    if (serverName != _serverName)
                    {
                        serverName = _serverName;

                        new Business.MSG_SERVERINFO().SendToServer(dbContext, null);
                    }

                    if (mediaUrl != _mediaUrl)
                    {
                        mediaUrl = _mediaUrl;

                        new Business.MSG_HTTPSERVER().SendToServer(dbContext, null);
                    }
                }

                FlushRooms(dbContext);

                if (isShutDown)
                {
                    dbContext.Users1.Clear();
                    dbContext.UserData.Clear();
                    dbContext.Assets1.Clear();

                    dbContext.Rooms
                        .Where(r => (r.Flags & (int)RoomFlags.RF_Closed) != 0)
                        .ToList()
                        .ForEach(r =>
                        {
                            r.Flags &= ~(int)RoomFlags.RF_Closed;
                        });
                }
                else
                {
                    dbContext.Rooms.AsNoTracking()
                        .Where(r => roomsCache.Keys.Contains(r.RoomId))
                        .Where(r => _lastCycleDate == null || r.LastModified > _lastCycleDate)
                        .ToList()
                        .ForEach(r =>
                        {
                            if (r.LastModified > roomsCache[r.RoomId].LastModified)
                            {
                                roomsCache[r.RoomId].Read(dbContext);
                            }
                        });

                    dbContext.Rooms.AsNoTracking()
                        .Where(r => !roomsCache.Keys.Contains(r.RoomId))
                        .Where(r => (r.Flags & (int)RoomFlags.RF_DropZone) != 0)
                        .ToList()
                        .ForEach(r =>
                        {
                            roomsCache[r.RoomId] = new RoomBuilder(r.RoomId);
                            roomsCache[r.RoomId].Read(dbContext);
                        });

                    var sessionUserIDs = SessionManager.sessionStates.Keys.Select(i => (Int32)i).ToList();

                    dbContext.Users1
                        .Where(u => !sessionUserIDs.Contains(u.UserId))
                        .ToList()
                        .ForEach(user =>
                        {
                            dbContext.Users1.Remove(user);
                        });

                    dbContext.Users1
                        .Where(u => sessionUserIDs.Contains(u.UserId))
                        .ToList()
                        .ForEach(user =>
                        {
                            var sessionState = SessionManager.sessionStates[(UInt32)user.UserId];

                            user.Flags = sessionState.userFlags;
                            user.RoomId = sessionState.RoomID;
                            user.Name = sessionState.details.name;
                        });

                    dbContext.UserData
                        .Where(u => !sessionUserIDs.Contains(u.UserId))
                        .ToList()
                        .ForEach(user =>
                        {
                            dbContext.UserData.Remove(user);
                        });

                    dbContext.UserData
                        .Where(u => sessionUserIDs.Contains(u.UserId))
                        .ToList()
                        .ForEach(user =>
                        {
                            var sessionState = SessionManager.sessionStates[(UInt32)user.UserId];

                            user.RoomPosH = sessionState.details.roomPos.h;
                            user.RoomPosV = sessionState.details.roomPos.v;
                            user.FaceNbr = sessionState.details.faceNbr;
                            user.ColorNbr = sessionState.details.colorNbr;
                        });

                    SessionManager.sessionStates.Values.ToList().ForEach(sessionState =>
                    {
                        var sqlParam = new SqlParameter("userID", (int)sessionState.UserID);
                        dbContext.Database.ExecuteSqlCommand("EXEC Users.FlushUserAssets @userID", sqlParam);

                        if ((sessionState.userFlags & (int)(UserFlags.U_Pin | UserFlags.U_PropGag)) == 0)
                        {
                            for (var j = 0; j < (sessionState.details.propSpec?.Length ?? 0); j++)
                            {
                                dbContext.Assets1.Add(new Assets1
                                {
                                    UserId = (int)sessionState.UserID,
                                    AssetIndex = (byte)(j + 1),
                                    AssetId = sessionState.details.propSpec[j].id,
                                    AssetCrc = (int)sessionState.details.propSpec[j].crc,
                                });
                            }
                        }
                    });
                }

                if (dbContext.HasUnsavedChanges())
                {
                    try
                    {
                        dbContext.SaveChanges();
                    }
                    catch (Exception ex)
                    {
                        ex.DebugLog();
                    }
                }
            }

            _lastCycleDate = DateTime.UtcNow;
        }

        public static void Shutdown()
        {
            var threadShutdownWait_InMilliseconds = ConfigManager.GetValue<int>("ThreadShutdownWait_InMilliseconds", 2500).Value;

            isShutDown = true;

            new Business.MSG_SERVERDOWN
            {
                reason = ServerDownFlags.SD_ServerDown,
                whyMessage = "Server going down!",
            }.SendToServer(null, null);

            Thread.Sleep(threadShutdownWait_InMilliseconds);

            PalaceAsyncSocket.Shutdown();
            PalaceAsyncSocket.Dispose();
            WebAsyncSocket.Shutdown();
            WebAsyncSocket.Dispose();
            SessionManager.Dispose();
            PluginManager.Dispose();
            ThreadController.serverShutdown.Set();
            ThreadController.Dispose();
        }
    }
}
