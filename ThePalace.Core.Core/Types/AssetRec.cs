using System;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;

namespace ThePalace.Core.Types
{
    public class AssetRec
    {
        public AssetSpec propSpec;
        //public Int32 rHandle;
        public UInt32 blockSize;
        public Int32 blockOffset;
        public Int32 lastUsed;
        public Int32 nameOffset;
        public UInt16 blockNbr;
        public UInt16 nbrBlocks;
        public UInt32 flags;
        public UInt32 size;
        //public LegacyAssetTypes type;
        public string name;
        public byte[] data;

        public AssetRec()
        {
            propSpec = new AssetSpec();
        }

        public AssetRec(AssetSpec assetSpec)
        {
            propSpec = assetSpec;
        }

        public byte[] Serialize()
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32(propSpec.id);    // AssetID
                packet.WriteInt32(0);              // rHandle
                packet.WriteInt32(blockOffset);    // blockOffset
                packet.WriteInt32(blockSize);      // blockSize
                packet.WriteInt32(lastUsed);       // lastUsed
                packet.WriteInt32(nameOffset);     // nameOffset
                packet.WriteInt32(flags);          // flags
                packet.WriteInt32(propSpec.crc);   // crc
                packet.WritePString(name, 32);     // name

                return packet.getData();
            }
        }

        public static int SizeOf
        {
            get
            {
                return 32;
            }
        }
    }
}
