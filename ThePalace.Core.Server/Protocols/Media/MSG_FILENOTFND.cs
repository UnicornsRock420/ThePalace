using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("fnfe")]
    public struct MSG_FILENOTFND : ISendProtocol
    {
        public string fileName;

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WritePString(fileName, 64);

                return packet.getData();
            }
        }

        public string SerializeJSON(object input = null)
        {
            return string.Empty;
        }
    }
}
