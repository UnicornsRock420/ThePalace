using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;

namespace ThePalace.Server.Protocols
{
    [Description("usrP")]
    public struct MSG_USERPROP : IReceiveProtocol, ISendProtocol
    {
        public Int16 nbrProps;
        public AssetSpec[] propSpec;

        public void Deserialize(Packet packet)
        {
            nbrProps = (Int16)packet.ReadSInt32();

            propSpec = new AssetSpec[nbrProps];

            for (var j = 0; j < nbrProps; j++)
            {
                propSpec[j] = new AssetSpec(packet);
            }
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32(nbrProps);

                for (var j = 0; j < nbrProps; j++)
                {
                    packet.AppendBytes(propSpec[j].Serialize());
                }

                return packet.getData();
            }
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);
                nbrProps = (Int16)jsonResponse.propSpec.Count;
            }
            catch
            {
                nbrProps = 0;
            }

            propSpec = new AssetSpec[nbrProps];

            for (var j = 0; j < nbrProps; j++)
            {
                var id = (Int32)jsonResponse.propSpec[j].id;
                var crc = (UInt32)jsonResponse.propSpec[j].crc;

                propSpec[j] = new AssetSpec(id, crc);
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                propSpec = propSpec,
            });
        }
    }
}
