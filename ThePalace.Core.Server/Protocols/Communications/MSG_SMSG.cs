using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("smsg")]
    public struct MSG_SMSG : IReceiveProtocol
    {
        string text;

        public void Deserialize(Packet packet)
        {
            text = packet.ReadCString();
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                text = jsonResponse.text;
            }
            catch
            {
            }
        }
    }
}
