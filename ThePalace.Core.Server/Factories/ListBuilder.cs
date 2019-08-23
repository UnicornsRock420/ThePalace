using System;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Factories
{
    public class ListBuilder : ISendProtocol
    {
        public UInt32 primaryID;
        public Int16 flags;
        public Int16 refNum;
        public string name;

        public byte[] Serialize(object input = null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                name = string.Empty;
            }

            using (var packet = new Packet())
            {
                packet.WriteInt32(primaryID);
                packet.WriteInt16(flags);
                packet.WriteInt16(refNum);
                packet.WritePString(name, 32, 1, false);
                packet.AlignBytes(4);

                return packet.getData();
            }
        }

        public string SerializeJSON(object input = null)
        {
            return string.Empty;
        }
    }
}
