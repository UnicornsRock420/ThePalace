using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;

namespace ThePalace.Server.Protocols
{
    [Description("susr")]
    public struct MSG_SUPERUSER : IReceiveProtocol
    {
        public string password;

        public void Deserialize(Packet packet)
        {
            password = packet.ReadPString(64).GetBytes().DecryptString();
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                password = jsonResponse.password;
            }
            catch
            {
            }
        }
    }
}
