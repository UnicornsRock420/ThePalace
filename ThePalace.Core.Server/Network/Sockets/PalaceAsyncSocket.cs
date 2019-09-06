using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using System.Threading;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;
using ThePalace.Core.Utility;
using ThePalace.Server.Core;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network.Drivers;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Network.Sockets
{
    public static class PalaceAsyncSocket
    {
        private static volatile ManualResetEvent signalEvent = new ManualResetEvent(false);

        public static volatile ConcurrentDictionary<UInt32, PalaceConnectionState> connectionStates = new ConcurrentDictionary<UInt32, PalaceConnectionState>();

        public static void Init()
        {
            var bindAddress = ConfigManager.GetValue("BindAddress", string.Empty);
            var bindPalacePort = ConfigManager.GetValue<short>("BindPalacePort", 9998).Value;
            var listenBacklog = ConfigManager.GetValue<int>("ListenBacklog", 100).Value;
            IPAddress ipAddress = null;

            if (string.IsNullOrWhiteSpace(bindAddress) || !IPAddress.TryParse(bindAddress, out ipAddress))
            {
                var ipHostInfo = Dns.GetHostEntry(Dns.GetHostName());
                ipAddress = ipHostInfo.AddressList[0];
            }

            if (ipAddress == null)
            {
                throw new Exception($"Cannot bind to {bindAddress}:{bindPalacePort} (address:port)!");
            }

            var localEndPoint = new IPEndPoint(IPAddress.Any, bindPalacePort);
            var listener = new Socket(ipAddress.AddressFamily, SocketType.Stream, ProtocolType.Tcp);

            try
            {
                listener.Bind(localEndPoint);

                Logger.ConsoleLog("Palace Socket Listener Operational. Waiting for connections...");

                listener.Listen(listenBacklog);

                while (!ServerState.isShutDown)
                {
                    signalEvent.Reset();

                    listener.BeginAccept(new AsyncCallback(AcceptCallback), listener);

                    signalEvent.WaitOne();
                }

                ServerState.RefreshSettings();
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }
        }

        public static void Shutdown()
        {
            signalEvent.Set();
        }

        public static void Dispose()
        {
            lock (connectionStates)
            {
                connectionStates.Keys.ToList().ForEach(key =>
                {
                    connectionStates[key].DropConnection();
                });
                connectionStates.Clear();
                connectionStates = null;
            }
        }

        private static void AcceptCallback(IAsyncResult ar)
        {
            signalEvent.Set();

            var listener = (Socket)ar.AsyncState;
            Socket handler = null;

            try
            {
                handler = listener.EndAccept(ar);
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }

            var ipAddress = handler.GetIPAddress();

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
                    Logger.Log(MessageTypes.Info, $"Banned connection from: {ipAddress}");

                    var data = new MSG_SERVERDOWN
                    {
                        whyMessage = "You have been banned!",
                    }.Serialize();

                    handler.Send(new Header
                    {
                        eventType = EventTypes.MSG_SERVERDOWN.ToString(),
                        length = (UInt32)data.Length,
                        refNum = (Int32)ServerDownFlags.SD_Banished,
                    }.Serialize(data));

                    handler.DropConnection();

                    return;
                }
            }

            handler.SetKeepAlive();

            var sessionState = SessionManager.GetNewSession(SessionTypes.TcpSocket);
            if (sessionState == null)
            {
                Logger.Log(MessageTypes.Info, $"Server is full, turned away: {ipAddress}");

                var data = new MSG_SERVERDOWN
                {
                    whyMessage = "The Server is full!",
                }.Serialize();

                handler.Send(new Header
                {
                    eventType = EventTypes.MSG_SERVERDOWN.ToString(),
                    length = (UInt32)data.Length,
                    refNum = (Int32)ServerDownFlags.SD_ServerFull,
                }.Serialize(data));

                handler.DropConnection();

                return;
            }

            lock (connectionStates)
            {
                connectionStates.TryAdd(
                    sessionState.UserID,
                    new PalaceConnectionState
                    {
                        sessionState = sessionState,
                        tcpSocket = handler,
                    });

                ((PalaceSocketDriver)sessionState.driver).connectionState = connectionStates[sessionState.UserID];
            }

            Logger.Log(MessageTypes.Info, $"Connection from: {ipAddress}[{sessionState.UserID}]");

            try
            {
                handler.BeginReceive(connectionStates[sessionState.UserID].buffer, 0, connectionStates[sessionState.UserID].buffer.Length, 0, new AsyncCallback(ReadCallback), sessionState);
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }

            new Business.MSG_TIYID().Send(null, new Message
            {
                sessionState = sessionState,
            });
        }

        private static void ReadCallback(IAsyncResult ar)
        {
            var floodControlThreadshold_InMilliseconds = ConfigManager.GetValue<int>("FloodControlThreadshold_InMilliseconds", 1000).Value;
            var floodControlThreadshold_RawCount = ConfigManager.GetValue<int>("FloodControlThreadshold_RawCount", 100).Value;
            //var floodControlThreadshold_RawSize = ConfigManager.GetValue<int>("FloodControlThreadshold_RawSize", ???).Value;
            var floodControlThreadshold_TimeSpan = new TimeSpan(0, 0, 0, 0, floodControlThreadshold_InMilliseconds);

            var sessionState = (SessionState)ar.AsyncState;
            PalaceConnectionState connectionState;

            try
            {
                connectionState = connectionStates[sessionState.UserID];
            }
            catch (Exception ex)
            {
                ex.DebugLog();

                return;
            }

            var handler = connectionState.tcpSocket;
            var bytesReceived = 0;

            try
            {
                bytesReceived = handler.EndReceive(ar);
            }
            catch (SocketException ex)
            {
                ex.DebugLog();

                sessionState.driver.DropConnection();
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }

            if (bytesReceived > 0)
            {
                var data = new Packet(connectionState.buffer);

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
                        Logger.Log(MessageTypes.Info, $"Disconnect[{sessionState.UserID}]: Flood Control", "PalaceAsyncSocket.ReadCallback()");

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

                while (bytesReceived > 0 && connectionState.packet != null)
                {
                    if (!string.IsNullOrWhiteSpace(connectionState.header.eventType) || connectionState.bytesRemaining < 1)
                    {
                        try
                        {
                            connectionState.header = new Header();
                            connectionState.header.Deserialize(data);
                        }
                        catch { }

                        var mnemonic = Regex.Replace(connectionState.header.eventType, @"[^\w\d]+", string.Empty);
                        var type = PluginManager.GetType($"ThePalace.Server.Plugins.Protocols.{mnemonic}");

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

                        bytesReceived -= Header.SizeOf;

                        connectionState.bytesRemaining = (int)connectionState.header.length;
                    }

                    var toRead = connectionState.bytesRemaining > bytesReceived ? bytesReceived : connectionState.bytesRemaining;

                    if (toRead > 0)
                    {
                        try
                        {
                            connectionState.packet.AddRange(data.getData(toRead), toRead);
                            connectionState.bytesRemaining -= toRead;
                            bytesReceived -= toRead;

                            data.DropBytes(toRead);
                        }
                        catch (Exception ex)
                        {
                            ex.DebugLog();

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
                    }

                    if (connectionState.bytesRemaining < 1)
                    {
                        var mnemonic = Regex.Replace(connectionState.header.eventType, @"[^\w\d]+", string.Empty);
                        var type = PluginManager.GetType($"ThePalace.Server.Plugins.Protocols.{mnemonic}");
                        var message = (Message)null;

                        if (type == null)
                        {
                            type = Type.GetType($"ThePalace.Server.Protocols.{connectionState.header.eventType}");
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
                                using (var packet = new Packet(connectionState.packet))
                                {
                                    message.protocol.Deserialize(packet);
                                }

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

                        if (connectionState.packet != null)
                        {
                            connectionState.packet.Clear();
                        }
                    }
                }
            }
            else if (!connectionState.IsConnected())
            {
                connectionState.DropConnection();
            }

            try
            {
                handler.BeginReceive(connectionState.buffer, 0, connectionState.buffer.Length, 0, new AsyncCallback(ReadCallback), sessionState);
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }
        }

        public static void Send(this SessionState sessionState, byte[] byteData)
        {
            if (sessionState == null || !sessionState.driver.IsConnected() || !connectionStates.ContainsKey(sessionState.UserID))
            {
                return;
            }
            else if (byteData != null)
            {
                try
                {
                    var connectionState = connectionStates[sessionState.UserID];

                    lock (sessionState.driver)
                    {
                        connectionState.tcpSocket.BeginSend(byteData, 0, byteData.Length, 0, new AsyncCallback(SendCallback), sessionState);
                    }
                }
                catch (Exception ex)
                {
                    ex.DebugLog();
                }
            }
        }

        private static void SendCallback(IAsyncResult ar)
        {
            var sessionState = (SessionState)ar.AsyncState;

            if (sessionState == null || !sessionState.driver.IsConnected() || !connectionStates.ContainsKey(sessionState.UserID))
            {
                return;
            }

            try
            {
                var connectionState = connectionStates[sessionState.UserID];
                var handler = connectionState.tcpSocket;
                var bytesSent = handler.EndSend(ar);
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
                        (connectionState.latencyCounter > latencyMaxCounter) ||
                        (connectionState.lastActivity.HasValue && connectionState.lastPacketReceived.HasValue && (connectionState.lastPacketReceived.Value.Subtract(connectionState.lastActivity.Value) > dosTimeout_Timespan)))
                    {
                        if (!connectionState.IsConnected())
                        {
                            Logger.Log(MessageTypes.Info, $"Disconnect[{connectionState.sessionState.UserID}]: Client-side", "ManageConnections()");
                        }

                        if (connectionState.latencyCounter > latencyMaxCounter)
                        {
                            Logger.Log(MessageTypes.Info, $"Disconnect[{connectionState.sessionState.UserID}]: Latency Counter", "ManageConnections()");
                        }

                        if (connectionState.lastActivity.HasValue && connectionState.lastPacketReceived.HasValue && (connectionState.lastPacketReceived.Value.Subtract(connectionState.lastActivity.Value) > dosTimeout_Timespan))
                        {
                            Logger.Log(MessageTypes.Info, $"Disconnect[{connectionState.sessionState.UserID}]: DOS Attempt", "ManageConnections()");
                        }

                        lock (connectionStates)
                        {
                            connectionState.DropConnection();
                        }
                    }
                    else if (connectionState.lastActivity.HasValue && !connectionState.lastPacketReceived.HasValue && (DateTime.UtcNow.Subtract(connectionState.lastActivity.Value) <= dosTimeout_Timespan))
                    {
                        connectionState.latencyCounter++;
                    }
                    else if (!connectionState.lastPinged.HasValue && connectionState.lastPacketReceived.HasValue && (DateTime.UtcNow.Subtract(connectionState.lastPacketReceived.Value) > idleTimeout_Timespan))
                    {
                        connectionState.lastPinged = DateTime.UtcNow;

                        // Idle clients

                        Logger.Log(MessageTypes.Info, $"Disconnect[{connectionState.sessionState.UserID}]: Idle user", "ManageConnections()");

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

        public static bool IsConnected(this PalaceConnectionState connectionState)
        {
            var passiveIdleTimeout_InSeconds = ConfigManager.GetValue<Int16>("PassiveIdleTimeout_InSeconds", 15).Value;
            var passiveIdleTimeout_Timespan = new TimeSpan(0, 0, passiveIdleTimeout_InSeconds);

            try
            {
                if (connectionState.lastPacketReceived.HasValue && (DateTime.UtcNow.Subtract(connectionState.lastPacketReceived.Value) > passiveIdleTimeout_Timespan))
                {
                    return !connectionState.tcpSocket.Poll(1, SelectMode.SelectRead);
                }

                return connectionState.tcpSocket.Connected;
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

        public static void DropConnection(this PalaceConnectionState connectionState)
        {
            try
            {
                if (connectionState.sessionState.successfullyConnected)
                {
                    using (var dbContext = Database.For<ThePalaceEntities>())
                    {
                        var sqlParam = new SqlParameter("userID", (int)connectionState.sessionState.UserID);
                        dbContext.Database.ExecuteSqlCommand("EXEC Users.FlushUserDetails @userID", sqlParam);
                    }
                }

                connectionState.tcpSocket.DropConnection();
                connectionState.Dispose();

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

                lock (SessionManager.sessionStates)
                {
                    if (SessionManager.sessionStates.ContainsKey(connectionState.sessionState.UserID))
                    {
                        SessionManager.sessionStates[connectionState.sessionState.UserID].Dispose();
                        SessionManager.sessionStates.Remove(connectionState.sessionState.UserID);
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
    }
}
