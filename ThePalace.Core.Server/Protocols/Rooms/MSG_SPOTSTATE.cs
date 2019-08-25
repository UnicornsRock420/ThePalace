using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("sSta")]
    public struct MSG_SPOTSTATE : IReceiveProtocol, ISendProtocol
    {
        public Int16 roomID;
        public Int16 spotID;
        public Int16 state;

        public void Deserialize(Packet packet)
        {
            roomID = packet.ReadSInt16();
            spotID = packet.ReadSInt16();
            state = packet.ReadSInt16();
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt16(roomID);
                packet.WriteInt16(spotID);
                packet.WriteInt16(state);

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
                state = jsonResponse.state;
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
                state,
            });
        }
    }
}
