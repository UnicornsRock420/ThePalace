using System;
using ThePalace.Core.Factories;

namespace ThePalace.Core.Types
{
    public class FileHeaderRec
    {
        public Int32 dataOffset;
        public Int32 dataSize;
        public Int32 assetMapOffset;
        public Int32 assetMapSize;

        public byte[] Serialize()
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32(dataOffset);
                packet.WriteInt32(dataSize);
                packet.WriteInt32(assetMapOffset);
                packet.WriteInt32(assetMapSize);

                return packet.getData();
            }
        }

        public static int SizeOf
        {
            get
            {
                return 16;
            }
        }
    }
}
