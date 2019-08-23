using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using ThePalace.Core.Enums;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Network;

namespace ThePalace.Server.Protocols
{
    [Description("sInf")]
    public struct MSG_EXTENDEDINFO : IReceiveProtocol, ISendProtocol
    {
        public UInt32 flags;

        public void Deserialize(Packet packet)
        {
            var error = false;

            flags = packet.ReadUInt32();

            while (packet.Count > 0 && !error)
            {
                var id = packet.ReadSInt32();
                var length = packet.ReadSInt32();
                var buf = packet.getData(length, 0, true);

                switch ((ServerExtInfoTypes)id)
                {
                    case ServerExtInfoTypes.SI_EXT_NAME:
                        var userName = buf.ReadPString(32);

                        break;
                    case ServerExtInfoTypes.SI_EXT_PASS:
                        var password = buf.ReadPString(32);

                        break;
                    case ServerExtInfoTypes.SI_EXT_TYPE:
                        var clientType = buf.ReadPString(32);

                        break;
                    default:
                        error = true;
                        break;
                }
            }
        }

        public byte[] Serialize(object input = null)
        {
            var maxUserID = ConfigManager.GetValue<UInt32>("MaxUserID", 9999).Value;
            var serverName = ConfigManager.GetValue("ServerName", string.Empty);
            var mediaUrl = ConfigManager.GetValue("MediaUrl", string.Empty);
            var version = Assembly.GetExecutingAssembly().GetName().Version;
            var response = new List<byte[]>();
            var data = new byte[0];

            using (var packet = new Packet())
            {
                if ((flags & (int)ServerExtInfoInFlags.SI_Avatar_URL) != 0)
                {
                    data = string.Empty.WriteCString();
                    packet.WriteInt32((int)ServerExtInfoTypes.SI_INF_AURL);
                    packet.WriteInt32(data.Length);
                    packet.AppendBytes(data);
                    response.Add(packet.getData());

                    packet.Clear();
                }

                if ((flags & (int)ServerExtInfoInFlags.SI_Server_Version) != 0)
                {
                    data = $"{version.Major}.{version.Minor}.{version.Revision}.{version.Build}".WriteCString();
                    packet.WriteInt32((int)ServerExtInfoTypes.SI_INF_VERS);
                    packet.WriteInt32(data.Length);
                    packet.AppendBytes(data);
                    response.Add(packet.getData());

                    packet.Clear();
                }

                if ((flags & (int)ServerExtInfoInFlags.SI_SERVER_TYPE) != 0)
                {
                    data = $"{Environment.OSVersion}".WriteCString();
                    packet.WriteInt32((int)ServerExtInfoTypes.SI_INF_TYPE);
                    packet.WriteInt32(data.Length);
                    packet.AppendBytes(data);
                    response.Add(packet.getData());

                    packet.Clear();
                }

                if ((flags & (int)ServerExtInfoInFlags.SI_SERVER_FLAGS) != 0)
                {
                    packet.WriteInt32((int)ServerExtInfoTypes.SI_INF_FLAG);
                    packet.WriteInt32(9);
                    packet.WriteInt32((int)ServerExtInfoOutFlags.FF_GuestsAreMembers);
                    packet.WriteInt32(maxUserID);
                    packet.WriteByte(2);
                    response.Add(packet.getData());

                    packet.Clear();
                }

                if ((flags & (int)ServerExtInfoInFlags.SI_NUM_USERS) != 0)
                {
                    packet.WriteInt32((int)ServerExtInfoTypes.SI_INF_NUM_USERS);
                    packet.WriteInt32(4);
                    packet.WriteInt32(SessionManager.GetServerUserCount());
                    response.Add(packet.getData());

                    packet.Clear();
                }

                if ((flags & (int)ServerExtInfoInFlags.SI_SERVER_NAME) != 0)
                {
                    data = serverName.WriteCString();
                    packet.WriteInt32((int)ServerExtInfoTypes.SI_INF_NAME);
                    packet.WriteInt32(data.Length);
                    packet.AppendBytes(data);
                    response.Add(packet.getData());

                    packet.Clear();
                }

                if ((flags & (int)ServerExtInfoInFlags.SI_HTTP_URL) != 0)
                {
                    data = mediaUrl.WriteCString();
                    packet.WriteInt32((int)ServerExtInfoTypes.SI_INF_HURL);
                    packet.WriteInt32(data.Length);
                    packet.AppendBytes(data);
                    response.Add(packet.getData());

                    //packet.Clear();
                }
            }

            return response.SelectMany(b => b).ToArray();
        }

        public void DeserializeJSON(string json)
        {

        }

        public string SerializeJSON(object input = null)
        {
            return string.Empty;
        }
    }
}
