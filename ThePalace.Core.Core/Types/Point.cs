using System;
using ThePalace.Core.Factories;
using ThePalace.Core.Utility;

namespace ThePalace.Core.Types
{
    [Serializable]
    public class Point
    {
        public Int16 h;
        public Int16 v;

        public Point()
        {
            h = (Int16)RndGenerator.NextSecure(0, 512);
            v = (Int16)RndGenerator.NextSecure(0, 384);
        }

        public Point(Int16 hAxis, Int16 vAxis)
        {
            h = (Int16)hAxis;
            v = (Int16)vAxis;
        }

        public Point(Packet packet)
        {
            Deserialize(packet);
        }

        public void Deserialize(Packet packet)
        {
            v = packet.ReadSInt16();
            h = packet.ReadSInt16();
        }

        public byte[] Serialize()
        {
            using (var packet = new Packet())
            {
                packet.WriteInt16(v);
                packet.WriteInt16(h);

                return packet.getData();
            }
        }

        public static int SizeOf
        {
            get => 4;
        }
    }
}
