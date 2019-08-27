using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;

namespace ThePalace.Server.Protocols
{
    [Description("uLoc")]
    public struct MSG_USERMOVE : IReceiveProtocol, ISendProtocol
    {
        public Point pos;

        public void Deserialize(Packet packet)
        {
            pos = new Point(packet);
        }

        public byte[] Serialize(object input = null)
        {
            return pos.Serialize();
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                pos = new Point((Int16)jsonResponse.pos.h, (Int16)jsonResponse.pos.v);
            }
            catch
            {
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                pos = pos,
            });
        }
    }
}
