using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Server.Core;
using ThePalace.Server.Factories;
using ThePalace.Server.Models;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Network
{
    public static class AssetLoader
    {
        private static volatile ConcurrentDictionary<Int32, AssetState> inboundQueue = new ConcurrentDictionary<Int32, AssetState>();
        private static volatile Queue<AssetState> outboundQueue = new Queue<AssetState>();

        public static volatile ConcurrentDictionary<Int32, AssetRec> assetsCache = new ConcurrentDictionary<Int32, AssetRec>();

        public static void ManageAssetsOutboundQueue()
        {
            AssetState assetState = null;

            if (outboundQueue.Count > 0)
            {
                lock (outboundQueue)
                {
                    if (outboundQueue.Count > 0)
                    {
                        assetState = outboundQueue.Dequeue();
                    }
                }
            }

            if (assetState == null)
            {
                ThreadController.manageAssetsOutboundQueueSignalEvent.Reset();

                return;
            }

            if (assetState.sessionState.driver.IsConnected() && !assetState.assetStream.HasUnsavedChanges)
            {
                var assetSend = new Business.MSG_ASSETSEND();
                assetSend.Send(null, new Message
                {
                    assetState = assetState,
                    sessionState = assetState.sessionState,
                });
            }

            if (!assetState.sessionState.driver.IsConnected() || !assetState.assetStream.hasData)
            {
                assetState.assetStream.Dispose();
            }
            else
            {
                lock (outboundQueue)
                {
                    outboundQueue.Enqueue(assetState);

                    ThreadController.manageAssetsOutboundQueueSignalEvent.Set();
                }
            }
        }

        public static void ManageAssetsInboundQueue()
        {
            if (inboundQueue.Count < 1)
            {
                ThreadController.manageAssetsInboundQueueSignalEvent.Reset();

                return;
            }

            inboundQueue.Values.ToList().ForEach(entry =>
            {
                if (!entry.sessionState.driver.IsConnected())
                {
                    entry.assetStream.Dispose();

                    inboundQueue.Remove(entry.assetStream.assetRec.propSpec.id);
                }
            });

            using (var dbContext = Database.For<ThePalaceEntities>())
            {
                var cacheKeys = assetsCache.Keys.ToList();
                var assetIDs = dbContext.Assets1.AsNoTracking()
                    .Where(a => cacheKeys.Contains(a.AssetId))
                    .Select(a => a.AssetId)
                    .ToList();

                assetsCache.ToList().ForEach(entry =>
                {
                    if (!assetIDs.Contains(entry.Key))
                    {
                        assetsCache.Remove(entry.Key);
                    }
                });
            }
        }

        public static void OutboundQueueTransfer(SessionState sessionState, AssetSpec assetSpec)
        {
            var assetStream = new AssetStream();

            if (assetStream.Open(assetSpec))
            {
                lock (outboundQueue)
                {
                    outboundQueue.Enqueue(new AssetState
                    {
                        sessionState = sessionState,
                        assetStream = assetStream,
                    });
                }

                ThreadController.manageAssetsOutboundQueueSignalEvent.Set();
            }
        }

        public static void AppendInboundChunk(SessionState sessionState, AssetStream chunk)
        {
            AssetState entry;

            if (inboundQueue.ContainsKey(chunk.assetRec.propSpec.id))
            {
                entry = inboundQueue[chunk.assetRec.propSpec.id];
            }
            else
            {
                entry = new AssetState
                {
                    sessionState = sessionState,
                    assetStream = chunk,
                };

                inboundQueue[chunk.assetRec.propSpec.id] = entry;
            }

            if (entry.sessionState.driver.IsConnected() && entry.assetStream.hasData && entry.sessionState.UserID == sessionState.UserID)
            {
                entry.assetStream.CopyChunkData(chunk);

                entry.assetStream.assetRec.blockNbr++;
            }

            if (entry.assetStream.assetRec.blockNbr == entry.assetStream.assetRec.nbrBlocks)
            {
                entry.assetStream.Write();
            }

            if (!entry.sessionState.driver.IsConnected() || !entry.assetStream.hasData || entry.assetStream.assetRec.blockNbr == entry.assetStream.assetRec.nbrBlocks)
            {
                entry.assetStream.Dispose();

                inboundQueue.Remove(entry.assetStream.assetRec.propSpec.id);
            }
        }

        public static void CheckAssets(SessionState sessionState, AssetSpec propSpec)
        {
            CheckAssets(sessionState, new AssetSpec[] { propSpec });
        }

        public static void CheckAssets(SessionState sessionState, IEnumerable<AssetSpec> propSpecs)
        {
            try
            {
                using (var assetStream = new AssetStream())
                {
                    foreach (var propSpec in propSpecs)
                    {
                        if (!inboundQueue.ContainsKey(propSpec.id))
                        {
                            if (!assetStream.Open(propSpec))
                            {
                                var assetQuery = new MSG_ASSETQUERY
                                {
                                    assetType = LegacyAssetTypes.RT_PROP,
                                    assetSpec = propSpec,
                                };

                                sessionState.Send(assetQuery, EventTypes.MSG_ASSETQUERY, 0);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }
        }
    }
}
