using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("kill")]
    public struct MSG_KILLUSER : IReceiveProtocol
    {
        public UInt32 target;

        public void Deserialize(Packet packet)
        {
            target = packet.ReadUInt32();
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                target = jsonResponse.target;
            }
            catch
            {
            }
        }
    }
}
