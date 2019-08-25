using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;

namespace ThePalace.Server.Protocols
{
    [Description("ofNs")]
    public struct MSG_SPOTINFO : IReceiveProtocol
    {
        public HotspotRec spot;
        public Int16 roomID;

        public void Deserialize(Packet packet)
        {
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                roomID = jsonResponse.roomID;

                spot = new HotspotRec();
                spot.id = jsonResponse.spotID;
                spot.name = jsonResponse.name;
                spot.script = jsonResponse.script;
                spot.dest = jsonResponse.dest;
                spot.flags = jsonResponse.flags;
            }
            catch
            {
            }
        }
    }
}
