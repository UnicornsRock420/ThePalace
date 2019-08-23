using Newtonsoft.Json;
using System.ComponentModel;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("ryit")]
    public struct MSG_DIYIT : ISendProtocol
    {
        public string ipAddress;

        public byte[] Serialize(object input = null)
        {
            return null;
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                ipAddress,
            });
        }
    }
}
