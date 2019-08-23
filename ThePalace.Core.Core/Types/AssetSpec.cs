using System;
using ThePalace.Core.Factories;

namespace ThePalace.Core.Types
{
    public class AssetSpec
    {
        public Int32 id;
        public UInt32 crc;

        public AssetSpec()
        {
            id = 0;
            crc = 0;
        }

        public AssetSpec(Int32 ID, UInt32 Crc)
        {
            id = ID;
            crc = Crc;
        }

        public AssetSpec(Packet packet)
        {
            Deserialize(packet);
        }

        public void Deserialize(Packet packet)
        {
            id = packet.ReadSInt32();
            crc = packet.ReadUInt32();
        }

        public byte[] Serialize()
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32(id);
                packet.WriteInt32(crc);

                return packet.getData();
            }
        }
    }
}
