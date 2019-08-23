using Newtonsoft.Json;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("log ")]
    public struct MSG_USERLOG : ISendProtocol
    {
        public UInt32 nbrUsers;

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32(nbrUsers);

                return packet.getData();
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                nbrUsers = nbrUsers,
            });
        }
    }
}
