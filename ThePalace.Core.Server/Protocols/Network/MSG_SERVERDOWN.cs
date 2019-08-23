using Newtonsoft.Json;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("down")]
    public struct MSG_SERVERDOWN : ISendProtocol
    {
        public string whyMessage;

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                if (!string.IsNullOrWhiteSpace(whyMessage))
                {
                    packet.WriteCString(whyMessage);
                }

                return packet.getData();
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                whyMessage = whyMessage,
            });
        }
    }
}
