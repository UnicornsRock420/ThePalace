using Newtonsoft.Json;
using System;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Web.Protocols
{
    public struct Header : IReceiveProtocol, ISendProtocol
    {
        [JsonProperty]
        public EventTypes eventType;

        [JsonProperty]
        public Int32 refNum;

        [JsonProperty]
        public string message;

        [JsonProperty]
        public string ipAddress;

        public Header(Header header)
        {
            eventType = header.eventType;
            refNum = header.refNum;
            message = header.message;
            ipAddress = header.ipAddress;
        }

        public void Deserialize(Packet packet)
        {

        }

        public byte[] Serialize(object input = null)
        {
            return null;
        }

        public void DeserializeJSON(string json)
        {
            this = JsonConvert.DeserializeObject<Header>(json);
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}
