using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("navR")]
    public struct MSG_ROOMGOTO : IReceiveProtocol
    {
        public Int16 dest;

        public void Deserialize(Packet packet)
        {
            dest = packet.ReadSInt16();
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                dest = jsonResponse.dest;
            }
            catch
            {
            }
        }
    }
}
