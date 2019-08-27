using Newtonsoft.Json;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("uSta")]
    public struct MSG_USERSTATUS : ISendProtocol
    {
        public Int16 flags;
        public Guid hash;

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt16(flags);

                return packet.getData();
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                flags = flags,
                hash = hash.ToString(),
            });
        }
    }
}
