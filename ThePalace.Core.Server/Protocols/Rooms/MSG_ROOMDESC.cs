using Newtonsoft.Json;
using System.ComponentModel;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Factories;

namespace ThePalace.Server.Protocols
{
    [Description("room")]
    public struct MSG_ROOMDESC : ISendProtocol
    {
        public RoomBuilder room;

        public byte[] Serialize(object input = null)
        {
            return room.Serialize();
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
