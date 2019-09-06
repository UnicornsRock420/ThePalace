using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Server.Network.Sockets;
using ThePalace.Core.Utility;
using ThePalace.Server.Core;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network.Drivers;
using ThePalace.Server.Protocols;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace ThePalace.Server.Network.Sockets
{
    public static class WebAsyncSocket
    {
        public static volatile ConcurrentDictionary<UInt32, WebSocketConnectionState> connectionStates = new ConcurrentDictionary<UInt32, WebSocketConnectionState>();

        private static WebSocketServer listener = null;

        public static void Init()
        {
            var bindAddress = ConfigManager.GetValue("BindAddress", string.Empty);
            var bindWebSocketPort = ConfigManager.GetValue<short>("BindWebSocketPort", 10000).Value;
            var listenBacklog = ConfigManager.GetValue<int>("ListenBacklog", 100).Value;
            IPAddress ipAddress = null;

            if (string.IsNullOrWhiteSpace(bindAddress) || !IPAddress.TryParse(bindAddress, out ipAddress))
            {
                var ipHostInfo = Dns.GetHostEntry(Dns.GetHostName());
                ipAddress = ipHostInfo.AddressList[0];
            }

            if (ipAddress == null)
            {
                throw new Exception($"Cannot bind to {bindAddress}:{bindWebSocketPort} (address:port)!");
            }

            listener = new WebSocketServer(ipAddress, bindWebSocketPort);
            listener.AddWebSocketService<WebSocketHub>("/PalaceWebSocket");

            try
            {
                ThePalace.Core.Utility.Logger.ConsoleLog("WebSocket Socket Listener Operational. Waiting for connections...");

                listener.Start();
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }
        }

        public static void Shutdown()
        {
            listener.Stop();
        }

        public static void Dispose()
        {
            lock (connectionStates)
            {
                connectionStates.Values.ToList().ForEach(c =>
                {
                    c.DropConnection();
                });
                connectionStates.Clear();
                connectionStates = null;
            }
        }

        public static WebSocketConnectionState Accept(WebSocketHub hub)
        {
            var ipAddress = hub.Context.UserEndPoint.Address.MapToIPv4().ToString();

            using (var dbContext = Database.For<ThePalaceEntities>())
            {
                var now = DateTime.UtcNow;
                var bans = dbContext.Bans.AsNoTracking()
                    .AsEnumerable()
                    .Where(b =>
                        b.Ipaddress == ipAddress &&
                        (!b.UntilDate.HasValue || b.UntilDate.Value < now))
                    .Count();

                if (bans > 0)
                {
                    ThePalace.Core.Utility.Logger.Log(MessageTypes.Info, $"Banned connection from: {ipAddress}");

                    hub.Context.WebSocket.Send(new Header
                    {
                        eventType = EventTypes.MSG_SERVERDOWN.ToString(),
                        refNum = (int)ServerDownFlags.SD_Banished,
                        message = new MSG_SERVERDOWN
                        {
                            whyMessage = "You have been banned!",
                        }.SerializeJSON(),
                    }.SerializeJSON());

                    hub.Context.WebSocket.Close();

                    return null;
                }
            }

            var sessionState = SessionManager.GetNewSession(SessionTypes.WebSocket);
            if (sessionState == null)
            {
                ThePalace.Core.Utility.Logger.Log(MessageTypes.Info, $"Server is full, turned away: {ipAddress}");

                hub.Context.WebSocket.Send(new Header
                {
                    eventType = EventTypes.MSG_SERVERDOWN.ToString(),
                    refNum = (int)ServerDownFlags.SD_ServerFull,
                    message = new MSG_SERVERDOWN
                    {
                        whyMessage = "The Server is full!",
                    }.SerializeJSON(),
                }.SerializeJSON());

                hub.Context.WebSocket.Close();

                return null;
            }

            lock (connectionStates)
            {
                connectionStates.TryAdd(
                    sessionState.UserID,
                    new WebSocketConnectionState
                    {
                        sessionState = sessionState,
                        ipAddress = ipAddress,
                        webSocket = hub,
                    });

                ((WebSocketDriver)sessionState.driver).connectionState = connectionStates[sessionState.UserID];
            }

            ThePalace.Core.Utility.Logger.Log(MessageTypes.Info, $"Connection from: {ipAddress}[{sessionState.UserID}]");

            new Business.MSG_TIYID().Send(null, new Message
            {
                sessionState = sessionState,
            });

            return connectionStates[sessionState.UserID];
        }

        public static void Receive(WebSocketConnectionState connectionState, MessageEventArgs e)
        {
            var floodControlThreadshold_InMilliseconds = ConfigManager.GetValue<int>("FloodControlThreadshold_InMilliseconds", 1000).Value;
            var floodControlThreadshold_RawCount = ConfigManager.GetValue<int>("FloodControlThreadshold_RawCount", 100).Value;
            //var floodControlThreadshold_RawSize = ConfigManager.GetValue<int>("FloodControlThreadshold_RawSize", ???).Value;
            var floodControlThreadshold_TimeSpan = new TimeSpan(0, 0, 0, 0, floodControlThreadshold_InMilliseconds);

            var sessionState = connectionState.sessionState;
            var handler = connectionState.webSocket;
            var bytesReceived = e.Data?.Length ?? 0;
            var data = e.Data;

            if (bytesReceived > 0)
            {
                connectionState.lastActivity = DateTime.UtcNow;

                if (!sessionState.Authorized)
                {
                    #region Flood Control
                    connectionState.floodControl[DateTime.UtcNow] = bytesReceived;
                    //var rawSize = state.floodControl.Values.Sum();

                    var expired = connectionState.floodControl
                        .Where(f => f.Key > DateTime.UtcNow.Subtract(floodControlThreadshold_TimeSpan))
                        .Select(f => f.Key)
                        .ToList();

                    expired.ForEach(f =>
                    {
                        connectionState.floodControl.Remove(f);
                    });

                    if (connectionState.floodControl.Count > floodControlThreadshold_RawCount)
                    {
                        ThePalace.Core.Utility.Logger.Log(MessageTypes.Info, $"Disconnect[{sessionState.UserID}]: Flood Control", "WebAsyncSocket.Receive()");

                        new Business.MSG_SERVERDOWN
                        {
                            reason = ServerDownFlags.SD_Flood,
                            whyMessage = "Flood Control!",
                        }.Send(null, new Message
                        {
                            sessionState = sessionState,
                        });

                        connectionState.DropConnection();

                        return;
                    }
                    #endregion
                }

                if (bytesReceived > 0)
                {
                    try
                    {
                        connectionState.header = new Header();
                        connectionState.header.DeserializeJSON(data);
                    }
                    catch { }

                    var mnemonic = Regex.Replace(connectionState.header.eventType, @"[^\w\d]+", string.Empty);
                    var type = PluginManager.GetType($"ThePalace.Server.Plugins.Protocols.{mnemonic}");
                    var message = (Message)null;

                    if (type == null)
                    {
                        type = Type.GetType($"ThePalace.Server.Protocols.{connectionState.header.eventType}");
                    }

                    if (type == null)
                    {
                        new Business.MSG_SERVERDOWN
                        {
                            reason = ServerDownFlags.SD_CommError,
                            whyMessage = "Communication Error!",
                        }.Send(null, new Message
                        {
                            sessionState = sessionState,
                        });

                        connectionState.DropConnection();
                    }

                    if (type != null)
                    {
                        message = new Message
                        {
                            protocol = (IReceiveProtocol)Activator.CreateInstance(type),
                            header = new Header(connectionState.header),
                            sessionState = sessionState,
                        };
                    }

                    if (message != null)
                    {
                        try
                        {
                            message.protocol.DeserializeJSON(connectionState.header.message);

                            lock (SessionManager.messages)
                            {
                                SessionManager.messages.Enqueue(message);

                                ThreadController.manageMessagesQueueSignalEvent.Set();
                            }
                        }
                        catch (Exception ex)
                        {
                            ex.DebugLog();
                        }

                        connectionState.lastPinged = null;
                        connectionState.lastPacketReceived = DateTime.UtcNow;
                    }
                }
            }
            else if (!connectionState.IsConnected())
            {
                connectionState.DropConnection();
            }
        }

        public static void Send(SessionState sessionState, WebSocketConnectionState connectionState, string data)
        {
            if (sessionState == null || !sessionState.driver.IsConnected())
            {
                return;
            }

            try
            {
                lock (sessionState.driver)
                {
                    connectionState.webSocket.Send(data);
                }
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }
        }

        public static bool IsConnected(this WebSocketConnectionState connectionState)
        {
            try
            {
                return connectionState.webSocket.Context.WebSocket.IsAlive;
            }
            catch (SocketException)
            {
                return false;
            }
            catch (Exception ex)
            {
                ex.DebugLog();

                return false;
            }
        }

        public static void DropConnection(this WebSocketConnectionState connectionState)
        {
            try
            {
                if (connectionState.sessionState.successfullyConnected)
                {
                    try
                    {
                        using (var dbContext = Database.For<ThePalaceEntities>())
                        {
                            var sqlParam = new SqlParameter("userID", (int)connectionState.sessionState.UserID);
                            dbContext.Database.ExecuteSqlCommand("EXEC Users.FlushUserDetails @userID", sqlParam);
                        }
                    }
                    catch (Exception ex)
                    {
                        ex.DebugLog();
                    }
                }

                try
                {
                    connectionState.webSocket.Context.WebSocket.Close();
                }
                catch (Exception ex)
                {
                    ex.DebugLog();
                }

                try
                {
                    connectionState.Dispose();
                }
                catch (Exception ex)
                {
                    ex.DebugLog();
                }

                if (connectionStates.ContainsKey(connectionState.sessionState.UserID))
                {
                    lock (connectionStates)
                    {
                        if (connectionStates.ContainsKey(connectionState.sessionState.UserID))
                        {
                            connectionStates.Remove(connectionState.sessionState.UserID);
                        }
                    }
                }

                if (SessionManager.sessionStates.ContainsKey(connectionState.sessionState.UserID))
                {
                    lock (SessionManager.sessionStates)
                    {
                        if (SessionManager.sessionStates.ContainsKey(connectionState.sessionState.UserID))
                        {
                            SessionManager.sessionStates[connectionState.sessionState.UserID].Dispose();
                            SessionManager.sessionStates.Remove(connectionState.sessionState.UserID);
                        }
                    }
                }

                if (connectionState.sessionState.successfullyConnected)
                {
                    new Business.MSG_LOGOFF().SendToServer(null, new Message
                    {
                        sessionState = connectionState.sessionState,
                    });
                }

                if (SessionManager.GetRoomUserCount(connectionState.sessionState.RoomID) < 1 && ServerState.roomsCache.ContainsKey(connectionState.sessionState.RoomID))
                {
                    ServerState.roomsCache[connectionState.sessionState.RoomID].Flags &= (~(int)RoomFlags.RF_Closed);
                }
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }
        }

        public static void ManageConnections()
        {
            var idleTimeout_InMinutes = ConfigManager.GetValue<Int16>("IdleTimeout_InMinutes", 10).Value;
            var idleTimeout_Timespan = new TimeSpan(0, idleTimeout_InMinutes, 0);
            var dosTimeout_InSeconds = ConfigManager.GetValue<Int16>("DOSTimeout_InSeconds", 25).Value;
            var dosTimeout_Timespan = new TimeSpan(0, 0, dosTimeout_InSeconds);
            var latencyMaxCounter = ConfigManager.GetValue<Int16>("LatencyMaxCounter", 25).Value;

            connectionStates.Values.ToList().ForEach(connectionState =>
            {
                try
                {
                    if (
                        // Disconnected client cleanup
                        !connectionState.IsConnected() ||
                        // DOS client cleanup
                        (connectionState.lastActivity.HasValue && connectionState.lastPacketReceived.HasValue && (connectionState.lastPacketReceived.Value.Subtract(connectionState.lastActivity.Value) > dosTimeout_Timespan)))
                    {
                        if (!connectionState.IsConnected())
                        {
                            ThePalace.Core.Utility.Logger.Log(MessageTypes.Info, $"Disconnect[{connectionState.sessionState.UserID}]: Client-side", "WebAsyncSocket.ManageConnections()");
                        }

                        if (connectionState.lastActivity.HasValue && connectionState.lastPacketReceived.HasValue && (connectionState.lastPacketReceived.Value.Subtract(connectionState.lastActivity.Value) > dosTimeout_Timespan))
                        {
                            ThePalace.Core.Utility.Logger.Log(MessageTypes.Info, $"Disconnect[{connectionState.sessionState.UserID}]: DOS Attempt", "WebAsyncSocket.ManageConnections()");
                        }

                        lock (connectionStates)
                        {
                            connectionState.DropConnection();
                        }
                    }
                    else if (!connectionState.lastPinged.HasValue && connectionState.lastPacketReceived.HasValue && (DateTime.UtcNow.Subtract(connectionState.lastPacketReceived.Value) > idleTimeout_Timespan))
                    {
                        connectionState.lastPinged = DateTime.UtcNow;

                        // Idle clients

                        ThePalace.Core.Utility.Logger.Log(MessageTypes.Info, $"Disconnect[{connectionState.sessionState.UserID}]: Idle user", "WebAsyncSocket.ManageConnections()");

                        connectionState.sessionState.Send(null, EventTypes.MSG_PING, (Int32)connectionState.sessionState.UserID);

                        new Business.MSG_PING().Send(null, new Message
                        {
                            sessionState = connectionState.sessionState,
                            protocol = null,
                        });
                    }
                    else if (connectionState.lastPinged.HasValue && (DateTime.UtcNow.Subtract(connectionState.lastPinged.Value) > idleTimeout_Timespan))
                    {
                        // Idle clients

                        new Business.MSG_SERVERDOWN
                        {
                            reason = ServerDownFlags.SD_Unresponsive,
                            whyMessage = "Idle Disconnect!",
                        }.Send(null, new Message
                        {
                            sessionState = connectionState.sessionState,
                        });

                        lock (connectionStates)
                        {
                            connectionState.DropConnection();
                        }
                    }
                }
                catch (Exception ex)
                {
                    ex.DebugLog();
                }
            });
        }
    }
}
