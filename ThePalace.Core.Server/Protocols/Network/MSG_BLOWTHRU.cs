using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("blow")]
    public struct MSG_BLOWTHRU : IReceiveProtocol, ISendProtocol
    {
        public UInt32 flags;
        public UInt32 nbrUsers;
        public List<UInt32> userIDs; /* iff nbrUsers >= 0 */
        public UInt32 pluginTag;
        public byte[] embedded;

        public void Deserialize(Packet packet)
        {
            flags = packet.ReadUInt32();
            nbrUsers = packet.ReadUInt32();

            userIDs = new List<UInt32>();

            for (var j = 0; j < nbrUsers; j++)
            {
                var userID = packet.ReadUInt32();

                userIDs.Add(userID);
            }

            pluginTag = packet.ReadUInt32();
            embedded = packet.getData();
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32(pluginTag);
                packet.AppendBytes(embedded);

                return packet.getData();
            }
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                flags = jsonResponse.flags;
                userIDs = new List<UInt32>((UInt32[])jsonResponse.userIDs);
                pluginTag = jsonResponse.pluginTag;
                embedded = jsonResponse.embedded;
            }
            catch
            {
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                pluginTag = pluginTag,
                embedded = embedded,
            });
        }
    }
}
