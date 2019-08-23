using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ThePalace.Core.Constants;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;

namespace ThePalace.Core.Factories
{
    public class PropStream : IDisposable
    {
        private FileStream _fileStream;
        private string _pathToFile;

        public PropStream()
        {
        }

        public void Dispose()
        {
            if (_fileStream != null)
            {
                _fileStream.Dispose();
                _fileStream = null;
            }
        }

        public bool Open(string pathToFile, bool write = false)
        {
            _pathToFile = pathToFile;

            if (write)
            {
                if (File.Exists(_pathToFile))
                {
                    _fileStream = new FileStream(_pathToFile, FileMode.Truncate, FileAccess.Write);
                }
                else
                {
                    _fileStream = new FileStream(_pathToFile, FileMode.OpenOrCreate, FileAccess.Write);
                }
            }
            else
            {
                if (!File.Exists(_pathToFile))
                {
                    return false;
                }

                _fileStream = File.Open(_pathToFile, FileMode.Open, FileAccess.Read);
            }

            return true;
        }

        public void Read()
        {
            var _fileHeader = new FileHeaderRec();
            var _mapHeader = new MapHeaderRec();
            //var _types = new List<AssetTypeRec>();
            var _assets = new List<AssetRec>();

            var nameData = new byte[0];
            var data = new byte[0];
            var read = 0;

            _fileStream.Seek(0, SeekOrigin.Begin);
            data = new byte[FileHeaderRec.SizeOf];
            read = _fileStream.Read(data, 0, FileHeaderRec.SizeOf);

            if (read == FileHeaderRec.SizeOf)
            {
                using (var tmp = new Packet(data))
                {
                    _fileHeader.dataOffset = tmp.ReadSInt32();
                    _fileHeader.dataSize = tmp.ReadSInt32();
                    _fileHeader.assetMapOffset = tmp.ReadSInt32();
                    _fileHeader.assetMapSize = tmp.ReadSInt32();
                    //tmp.Clear();
                }
                //data = null;
            }
            else
            {
                throw new Exception("Bad Read");
            }

            _fileStream.Seek(_fileHeader.assetMapOffset, SeekOrigin.Begin);
            data = new byte[MapHeaderRec.SizeOf];
            read = _fileStream.Read(data, 0, MapHeaderRec.SizeOf);

            if (read == MapHeaderRec.SizeOf)
            {
                using (var tmp = new Packet(data))
                {
                    _mapHeader.nbrTypes = tmp.ReadSInt32();
                    _mapHeader.nbrAssets = tmp.ReadSInt32();
                    _mapHeader.lenNames = tmp.ReadSInt32();
                    _mapHeader.typesOffset = tmp.ReadSInt32();
                    _mapHeader.recsOffset = tmp.ReadSInt32();
                    _mapHeader.namesOffset = tmp.ReadSInt32();
                    //tmp.Clear();
                }
                //data = null;
            }
            else
            {
                throw new Exception("Bad Read");
            }

            if (_mapHeader.nbrTypes < 0 || _mapHeader.nbrAssets < 0 || _mapHeader.lenNames < 0)
            {
                throw new Exception("Invalid Map Header");
            }

            #region Asset Types


            _fileStream.Seek(_mapHeader.typesOffset + _fileHeader.assetMapOffset, SeekOrigin.Begin);
            data = new byte[_mapHeader.nbrTypes * AssetTypeRec.SizeOf];
            read = _fileStream.Read(data, 0, _mapHeader.nbrTypes * AssetTypeRec.SizeOf);

            if (read == _mapHeader.nbrTypes * AssetTypeRec.SizeOf)
            {
                // Deprecated
                //using (var tmp = new Packet(data))
                //{
                //    for (int i = 0; i < _mapHeader.nbrTypes; i++)
                //    {
                //        var t = new AssetTypeRec();
                //        t.Type = (LegacyAssetTypes)tmp.ReadUInt32();
                //        t.nbrAssets = tmp.ReadUInt32();
                //        t.firstAsset = tmp.ReadUInt32();

                //        _types.Add(t);
                //    }
                //    //data.Clear();
                //}
                //data = null;
            }
            else
            {
                throw new Exception("Bad Read");
            }

            #endregion

            #region Prop Names

            if (_mapHeader.lenNames > 0)
            {
                _fileStream.Seek(_mapHeader.namesOffset + _fileHeader.assetMapOffset, SeekOrigin.Begin);
                nameData = new byte[_mapHeader.lenNames];
                read = _fileStream.Read(nameData, 0, _mapHeader.lenNames);

                //if (read != mapHeader.lenNames)
                //{
                //    mapHeader.namesOffset = 0;
                //    mapHeader.lenNames = read;
                //}
            }

            #endregion

            #region Asset Records

            data = new byte[_mapHeader.nbrAssets * AssetRec.SizeOf];
            _fileStream.Seek(_mapHeader.recsOffset + _fileHeader.assetMapOffset, SeekOrigin.Begin);
            read = _fileStream.Read(data, 0, _mapHeader.nbrAssets * AssetRec.SizeOf);

            if (read == _mapHeader.nbrAssets * AssetRec.SizeOf)
            {
                using (var tmp = new Packet(data))
                {
                    for (int i = 0; i < _mapHeader.nbrAssets; i++)
                    {
                        var t = new AssetRec();
                        t.propSpec.id = tmp.ReadSInt32();
                        tmp.DropBytes(4); //rHandle
                        t.blockOffset = tmp.ReadSInt32();
                        t.blockSize = tmp.ReadUInt32();
                        t.lastUsed = tmp.ReadSInt32();
                        t.nameOffset = tmp.ReadSInt32();
                        t.flags = tmp.ReadUInt32();
                        t.propSpec.crc = tmp.ReadUInt32();
                        t.name = nameData.ReadPString(32, t.nameOffset);
                        t.data = new byte[t.blockSize];

                        _fileStream.Seek(_fileHeader.dataOffset + t.blockOffset, SeekOrigin.Begin);
                        read = _fileStream.Read(t.data, 0, (Int32)t.blockSize);

                        if (read == t.blockSize)
                        {
                            var crc = Cipher.ComputeCrc(t.data, 12, true);
                            if (t.propSpec.crc == crc)
                            {
                                //t.type = LegacyAssetTypes.RT_PROP;
                                _assets.Add(t);
                            }
                        }
                        else
                        {
                            throw new Exception("Bad Read");
                        }
                    }
                    //data.Clear();
                }
                //data = null;
            }
            else
            {
                throw new Exception("Bad Read");
            }

            #endregion

            #region Flush to Database

            using (var dbContext = Database.Database.For<ThePalaceEntities>())
            {
                _assets
                    //.Where(m => m.type == LegacyAssetTypes.RT_PROP)
                    //.ToList()
                    .ForEach(a =>
                    {
                        if (!dbContext.Assets.Any(m => m.AssetId == a.propSpec.id))
                        {
                            var asset = new Assets
                            {
                                AssetId = a.propSpec.id,
                                AssetCrc = (Int32)a.propSpec.crc,
                                Flags = (Int32)a.flags,
                                Name = a.name,
                                Data = a.data,
                            };

                            asset.LastUsed = AssetConstants.epoch.AddSeconds(a.lastUsed);

                            if (asset.LastUsed.CompareTo(AssetConstants.pepoch) < 0)
                            {
                                asset.LastUsed = AssetConstants.pepoch;
                            }

                            dbContext.Assets.Add(asset);
                        }
                    });

                if (dbContext.HasUnsavedChanges())
                {
                    dbContext.SaveChanges();
                }
            }

            #endregion
        }

        public void Write()
        {
            using (var dbContext = Database.Database.For<ThePalaceEntities>())
            {
                var list = dbContext.Assets.AsNoTracking()
                    .Where(a => (a.Flags & (int)ServerAssetFlags.HighResProp) == 0)
                    .ToList();

                var assetRecData = new List<byte>();
                var assetData = new List<byte>();
                var nameData = new List<byte>();

                list.ForEach(a =>
                    {
                        assetRecData.AddRange(new AssetRec
                        {
                            propSpec = new AssetSpec
                            {
                                id = a.AssetId,
                                crc = (UInt32)a.AssetCrc,
                            },
                            blockOffset = assetData.Count,
                            blockSize = (UInt32)a.Data.Length,
                            lastUsed = (Int32)a.LastUsed.Subtract(AssetConstants.epoch).TotalSeconds,
                            nameOffset = nameData.Count,
                            flags = (UInt32)a.Flags,
                            name = a.Name,
                        }.Serialize());
                        assetData.AddRange(a.Data);
                        nameData.AddRange(a.Name.WriteCString());
                    });

                // File Header
                _fileStream.Write(new FileHeaderRec
                {
                    dataOffset = FileHeaderRec.SizeOf + MapHeaderRec.SizeOf + AssetTypeRec.SizeOf + (list.Count * AssetRec.SizeOf),
                    dataSize = assetRecData.Count,
                    assetMapOffset = FileHeaderRec.SizeOf,
                    assetMapSize = MapHeaderRec.SizeOf,
                }.Serialize());

                // Map Header
                _fileStream.Write(new MapHeaderRec
                {
                    nbrTypes = 1,
                    nbrAssets = list.Count,
                    lenNames = nameData.Count,
                    typesOffset = FileHeaderRec.SizeOf + MapHeaderRec.SizeOf,
                    recsOffset = FileHeaderRec.SizeOf + MapHeaderRec.SizeOf + AssetTypeRec.SizeOf,
                    namesOffset = FileHeaderRec.SizeOf + MapHeaderRec.SizeOf + AssetTypeRec.SizeOf + (list.Count * AssetRec.SizeOf) + assetRecData.Count,
                }.Serialize());

                // Asset Type Rec
                _fileStream.Write(new AssetTypeRec
                {
                    type = LegacyAssetTypes.RT_PROP,
                    nbrAssets = (UInt32)list.Count,
                    firstAsset = 0,
                }.Serialize());

                // Asset Recs
                _fileStream.Write(assetRecData.ToArray());

                // Asset Data
                _fileStream.Write(assetData.ToArray());

                // Asset Names
                _fileStream.Write(nameData.ToArray());
            }
        }
    }
}
