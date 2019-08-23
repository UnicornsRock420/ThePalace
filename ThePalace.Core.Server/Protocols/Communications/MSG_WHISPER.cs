using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("whis")]
    public struct MSG_WHISPER : IReceiveProtocol, ISendProtocol
    {
        public UInt32 target;
        public string text;

        public void Deserialize(Packet packet)
        {
            target = packet.ReadUInt32();
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

                target = jsonResponse.target;
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
