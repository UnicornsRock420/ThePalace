using System;
using ThePalace.Core.Factories;

namespace ThePalace.Core.Types
{
    public class MapHeaderRec
    {
        public Int32 nbrTypes;
        public Int32 nbrAssets;
        public Int32 lenNames;
        public Int32 typesOffset;
        public Int32 recsOffset;
        public Int32 namesOffset;

        public byte[] Serialize()
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32(nbrTypes);
                packet.WriteInt32(nbrAssets);
                packet.WriteInt32(lenNames);
                packet.WriteInt32(typesOffset);
                packet.WriteInt32(recsOffset);
                packet.WriteInt32(namesOffset);

                return packet.getData();
            }
        }

        public static int SizeOf
        {
            get
            {
                return 24;
            }
        }
    }
}
