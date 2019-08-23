using Newtonsoft.Json;
using System;
using ThePalace.Core.Factories;

namespace ThePalace.Core.Types
{
    public class LoosePropRec
    {
        [JsonIgnore]
        public Int16 nextOfst;
        [JsonIgnore]
        public Int16 reserved;
        public AssetSpec propSpec;
        public Int32 flags;
        [JsonIgnore]
        public Int32 refCon;
        public Point loc;

        public byte[] Serialize()
        {
            using (var packet = new Packet())
            {
                packet.WriteInt16(nextOfst);
                packet.WriteInt16(reserved);
                packet.AppendBytes(propSpec.Serialize());
                packet.WriteInt32(flags);
                packet.WriteInt32(refCon);
                packet.AppendBytes(loc.Serialize());

                return packet.getData();
            }
        }

        public static int SizeOf
        {
            get => 24;
        }
    }
}
