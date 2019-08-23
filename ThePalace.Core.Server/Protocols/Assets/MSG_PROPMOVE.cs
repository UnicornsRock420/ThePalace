using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;

namespace ThePalace.Server.Protocols
{
    [Description("mPrp")]
    public struct MSG_PROPMOVE : IReceiveProtocol, ISendProtocol
    {
        public Int32 propNum;
        public Point pos;

        public void Deserialize(Packet packet)
        {
            propNum = packet.ReadSInt32();
            pos = new Point(packet);
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32(propNum);
                packet.AppendBytes(pos.Serialize());

                return packet.getData();
            }
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                propNum = jsonResponse.propNum;

                var h = (Int16)jsonResponse.pos.h;
                var v = (Int16)jsonResponse.pos.v;

                pos = new Point(h, v);
            }
            catch
            {
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                propNum = propNum,
                pos = pos,
            });
        }
    }
}
