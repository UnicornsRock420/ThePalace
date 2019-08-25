using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;

namespace ThePalace.Server.Protocols
{
    [Description("ofNr")]
    public struct MSG_ROOMINFO : IReceiveProtocol
    {
        public RoomRec room;

        public void Deserialize(Packet packet)
        {
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                room = new RoomRec();
                room.roomID = jsonResponse.roomID;
                room.roomName = jsonResponse.name;
                room.roomPicture = jsonResponse.pictName;
                room.roomArtist = jsonResponse.artistName;
                room.facesID = jsonResponse.facesID;
                room.roomFlags = jsonResponse.flags;
            }
            catch
            {
            }
        }
    }
}
