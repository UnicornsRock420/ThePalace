using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Utility;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("autr")]
    public struct MSG_AUTHRESPONSE : IReceiveProtocol
    {
        public string userName;
        public string password;

        public void Deserialize(Packet packet)
        {
            var nameAndPassword = packet.ReadPString(128).GetBytes().DecryptString().Split(':');

            userName = nameAndPassword[0];
            password = nameAndPassword[1];
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                userName = jsonResponse.userName;
                password = jsonResponse.password;
            }
            catch
            {
            }
        }
    }
}
