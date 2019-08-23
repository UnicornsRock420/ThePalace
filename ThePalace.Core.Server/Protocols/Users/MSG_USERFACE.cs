using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("usrF")]
    public struct MSG_USERFACE : IReceiveProtocol, ISendProtocol
    {
        public Int16 faceNbr;

        public void Deserialize(Packet packet)
        {
            faceNbr = packet.ReadSInt16();
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt16(faceNbr);

                return packet.getData();
            }
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                faceNbr = jsonResponse.faceNbr;
            }
            catch
            {
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                faceNbr = faceNbr,
            });
        }
    }
}
