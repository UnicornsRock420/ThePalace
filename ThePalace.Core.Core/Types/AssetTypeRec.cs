using System;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;

namespace ThePalace.Core.Types
{
    public class AssetTypeRec
    {
        public LegacyAssetTypes type;
        public UInt32 nbrAssets;
        public UInt32 firstAsset;

        public byte[] Serialize()
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32((Int32)type);
                packet.WriteInt32(nbrAssets);
                packet.WriteInt32(firstAsset);

                return packet.getData();
            }
        }

        public static int SizeOf
        {
            get
            {
                return 12;
            }
        }
    }
}
