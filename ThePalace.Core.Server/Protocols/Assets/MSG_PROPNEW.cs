using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;

namespace ThePalace.Server.Protocols
{
    [Description("prPn")]
    public struct MSG_PROPNEW : IReceiveProtocol, ISendProtocol
    {
        public AssetSpec propSpec;
        public Point loc;

        public void Deserialize(Packet packet)
        {
            propSpec = new AssetSpec(packet);
            loc = new Point(packet);
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.AppendBytes(propSpec.Serialize());
                packet.AppendBytes(loc.Serialize());

                return packet.getData();
            }
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                var id = (Int32)jsonResponse.propSpec.id;
                var crc = (UInt32)jsonResponse.propSpec.crc;
                var v = (Int16)jsonResponse.loc.v;
                var h = (Int16)jsonResponse.loc.h;

                propSpec = new AssetSpec(id, crc);
                loc = new Point(h, v);
            }
            catch
            {
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                propSpec = propSpec,
                loc = loc,
            });
        }
    }
}
