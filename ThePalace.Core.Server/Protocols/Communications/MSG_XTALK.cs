using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;

namespace ThePalace.Server.Protocols
{
    [Description("xtlk")]
    public struct MSG_XTALK : IReceiveProtocol, ISendProtocol
    {
        public string text;

        public void Deserialize(Packet packet)
        {
            text = packet.ReadPString(255, 0, 2, 2).GetBytes().DecryptString();
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt16((Int16)(text.Length + 3));
                packet.AppendBytes(text.EncryptString());
                packet.WriteByte(0);

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
