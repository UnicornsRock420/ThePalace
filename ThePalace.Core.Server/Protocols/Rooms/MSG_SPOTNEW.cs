using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("opSn")]
    public struct MSG_SPOTNEW : IReceiveProtocol, ISendProtocol
    {
        public void Deserialize(Packet packet)
        {

        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                return null;
            }
        }

        public void DeserializeJSON(string json)
        {

        }

        public string SerializeJSON(object input = null)
        {
            return string.Empty;
        }
    }
}
