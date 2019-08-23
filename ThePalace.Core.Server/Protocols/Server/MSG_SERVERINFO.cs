using Newtonsoft.Json;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("sinf")]
    public struct MSG_SERVERINFO : ISendProtocol
    {
        public Int32 serverPermissions;
        public string serverName;
        //public UInt32 serverOptions;
        //public UInt32 ulUploadCaps;
        //public UInt32 ulDownloadCaps;

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32(serverPermissions);
                packet.WritePString(serverName, 64);
                packet.PadBytes(4);
                //packet.WriteInt32(serverOptions);
                //packet.WriteInt32(ulUploadCaps);
                //packet.WriteInt32(ulDownloadCaps);

                return packet.getData();
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                serverPermissions,
                serverName,
            });
        }
    }
}
