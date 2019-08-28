using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;

namespace ThePalace.Server.Protocols
{
    [Description("coLs")]
    public struct MSG_SPOTMOVE : IReceiveProtocol, ISendProtocol
    {
        public Int16 roomID;
        public Int16 spotID;
        public Point pos;

        public void Deserialize(Packet packet)
        {
            roomID = packet.ReadSInt16();
            spotID = packet.ReadSInt16();
            pos = new Point(packet);
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt16(roomID);
                packet.WriteInt16(spotID);
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

                roomID = jsonResponse.roomID;
                spotID = jsonResponse.spotID;
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
                roomID,
                spotID,
                pos,
            });
        }
    }
}
