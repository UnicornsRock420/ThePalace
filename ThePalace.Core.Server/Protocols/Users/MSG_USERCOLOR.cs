using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("usrC")]
    public struct MSG_USERCOLOR : IReceiveProtocol, ISendProtocol
    {
        public Int16 colorNbr;

        public void Deserialize(Packet packet)
        {
            colorNbr = packet.ReadSInt16();
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt16(colorNbr);

                return packet.getData();
            }
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                colorNbr = jsonResponse.colorNbr;
            }
            catch
            {
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                colorNbr = colorNbr,
            });
        }
    }
}
