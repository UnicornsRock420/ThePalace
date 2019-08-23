using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("talk")]
    public struct MSG_TALK : IReceiveProtocol, ISendProtocol
    {
        public string text;

        public void Deserialize(Packet packet)
        {
            text = packet.ReadCString();
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteCString(text);

                return packet.getData();
            }
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                text = jsonResponse.text;
            }
            catch
            {
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                text = text,
            });
        }
    }
}
