using Newtonsoft.Json;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Factories;

namespace ThePalace.Server.Protocols
{
    [Description("sRom")]
    public struct MSG_ROOMSETDESC : IReceiveProtocol, ISendProtocol
    {
        public RoomBuilder room;

        public void Deserialize(Packet packet)
        {
            room = new RoomBuilder();

            room.Deserialize(packet);
        }

        public byte[] Serialize(object input = null)
        {
            return room.Serialize();
        }

        public void DeserializeJSON(string json)
        {
            // TODO: ???
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                roomID = room.ID,
            });
        }
    }
}
