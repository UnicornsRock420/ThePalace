using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using ThePalace.Core.Constants;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Server.Network;

namespace ThePalace.Server.Factories
{
    public class AssetStream : Packet, IDisposable, ISendProtocol
    {
        public AssetRec assetRec;

        private UInt32 _chunkMaxSize;
        private UInt32 _bytesRead;
        private MemoryStream _stream;
        private byte[] _buffer;

        public AssetStream(UInt32 chunkMaxSize = NetworkConstants.ASSET_STREAM_BUFFER_SIZE) : base()
        {
            _chunkMaxSize = (chunkMaxSize > NetworkConstants.ASSET_STREAM_BUFFER_SIZE) ? NetworkConstants.ASSET_STREAM_BUFFER_SIZE : chunkMaxSize;
            _buffer = new byte[NetworkConstants.FILE_STREAM_BUFFER_SIZE];
        }

        public AssetStream(AssetRec asset, UInt32 chunkMaxSize = NetworkConstants.ASSET_STREAM_BUFFER_SIZE) : base()
        {
            _buffer = new byte[NetworkConstants.FILE_STREAM_BUFFER_SIZE];

            assetRec = asset;

            AlignBytes((int)assetRec.size);
        }

        public bool Open(AssetSpec assetSpec)
        {
            try
            {
                if (AssetLoader.assetsCache.ContainsKey(assetSpec.id))
                {
                    assetRec = AssetLoader.assetsCache[assetSpec.id];
                }
                else
                {
                    using (var dbContext = Database.For<ThePalaceEntities>())
                    {
                        assetRec = dbContext.Assets.AsNoTracking()
                            .Where(a => a.AssetId == assetSpec.id)
                            .Where(a => (int)assetSpec.crc == 0 || a.AssetCrc == (int)assetSpec.crc)
                            .Where(a => (a.Flags & (Int32)ServerAssetFlags.HighResProp) == 0)
                            .AsEnumerable()
                            .Select(a => new AssetRec
                            {
                                //type = LegacyAssetTypes.RT_PROP,
                                propSpec = new AssetSpec(a.AssetId, (UInt32)a.AssetCrc),
                                name = a.Name,
                                flags = (UInt32)a.Flags,
                                size = (UInt32)(a.Data?.Length ?? 0),
                                data = a.Data,
                            })
                            .FirstOrDefault();
                    }
                }

                if (assetRec != null && assetRec.size > 0)
                {
                    assetRec.nbrBlocks = (UInt16)((assetRec.size / _chunkMaxSize) + ((assetRec.size % _chunkMaxSize) > 0 ? 1 : 0));
                    assetRec.blockSize = (UInt32)((assetRec.size - _bytesRead > _chunkMaxSize) ?
                        ((_chunkMaxSize > assetRec.size - _bytesRead) ? assetRec.size - _bytesRead : _chunkMaxSize) :
                        (assetRec.size - _bytesRead > 0) ? assetRec.size - _bytesRead : 0);

                    AlignBytes((int)assetRec.size);

                    if (assetRec.size <= 9000)
                    {
                        AssetLoader.assetsCache[assetSpec.id] = assetRec;
                    }

                    _stream = new MemoryStream(assetRec.data);

                    return true;
                }
            }
            catch (Exception ex)
            {
                ex.DebugLog();
            }

            return false;
        }

        public AssetRec AsRecord
        {
            get => new AssetRec
            {
                //type = assetRec.type,
                propSpec = assetRec.propSpec,
                flags = assetRec.flags,
                size = assetRec.size,
                name = assetRec.name,
                data = getData(),
            };
        }

        public bool Write()
        {
            using (var dbContext = Database.For<ThePalaceEntities>())
            {
                try
                {
                    var asset = dbContext.Assets
                        .Where(a => a.AssetId == assetRec.propSpec.id)
                        //.Where(a => (int)assetRec.propSpec.crc == 0 || a.AssetCrc == (int)assetRec.propSpec.crc)
                        .FirstOrDefault();

                    if (asset == null)
                    {
                        if (!HasUnsavedChanges)
                        {
                            assetRec.data = getData();
                        }
                        asset = new Assets
                        {
                            AssetId = assetRec.propSpec.id,
                            AssetCrc = (int)assetRec.propSpec.crc,
                            Flags = (int)assetRec.flags,
                            Name = assetRec.name,
                            LastUsed = DateTime.UtcNow,
                            Data = assetRec.data,
                        };

                        dbContext.Assets.Add(asset);

                        if (assetRec.size <= 9000)
                        {
                            AssetLoader.assetsCache[asset.AssetId] = AsRecord;
                        }

                        Logger.ConsoleLog($"Storing Asset {assetRec.propSpec.id}");
                    }

                    if (dbContext.HasUnsavedChanges())
                    {
                        dbContext.SaveChanges();
                        AcceptChanges();
                    }

                    return true;
                }
                catch (Exception ex)
                {
                    ex.DebugLog();
                }
            }

            return false;
        }

        public bool hasData
        {
            get => (assetRec.size - _bytesRead) > 0 && assetRec.blockSize > 0;
        }

        public void CopyChunkData(AssetStream chunk)
        {
            if (!HasUnsavedChanges)
            {
                NotifyPropertyChanged();
                _bytesRead = 0;
            }

            if (chunk.hasData)
            {
                for (int i = 0; i < chunk.assetRec.blockSize; i++)
                {
                    _data[i + chunk.assetRec.blockOffset] = chunk.assetRec.data[i];
                }
                _bytesRead += chunk.assetRec.blockSize;
            }
        }

        public byte[] Serialize(object input = null)
        {
            if (_stream != null && _stream.CanRead && hasData)
            {
                assetRec.blockSize = (UInt32)((assetRec.size - _bytesRead > _chunkMaxSize) ?
                    ((_chunkMaxSize > assetRec.size - _bytesRead) ? assetRec.size - _bytesRead : _chunkMaxSize) :
                    (assetRec.size - _bytesRead > 0) ? assetRec.size - _bytesRead : 0);

                try
                {
                    var read = _stream.Read(_buffer, 0, (int)assetRec.blockSize);
                    var buffer = _buffer;

                    _bytesRead += (UInt32)read;

                    _data.Clear();
                    WriteInt32((int)LegacyAssetTypes.RT_PROP);
                    AppendBytes(assetRec.propSpec.Serialize());
                    WriteInt32(assetRec.blockSize);
                    WriteInt32(assetRec.blockOffset);
                    WriteInt16(assetRec.blockNbr);
                    WriteInt16(assetRec.nbrBlocks);

                    if (assetRec.blockNbr < 1)
                    {
                        WriteInt32(assetRec.flags);
                        WriteInt32(assetRec.size);
                        WritePString(assetRec.name, 32);
                    }
                    else if (_bytesRead >= assetRec.size)
                    {
                        buffer = _buffer.Take((int)assetRec.blockSize).ToArray();
                    }

                    AppendBytes(buffer);

                    assetRec.blockNbr++;
                    assetRec.blockOffset += read;

                    return getData();
                }
                catch (Exception ex)
                {
                    ex.DebugLog();
                    Dispose();
                }
            }

            return null;
        }

        public string SerializeJSON(object input = null)
        {
            return string.Empty;
        }

        public void Dispose()
        {
            base.Dispose();

            if (_stream != null)
            {
                _stream.Dispose();
                _stream = null;
            }
            if (_buffer != null)
            {
                _buffer = null;
            }
        }
    }
}
