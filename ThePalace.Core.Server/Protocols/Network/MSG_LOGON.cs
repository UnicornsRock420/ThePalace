using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("regi")]
    [JsonObject]
    public struct MSG_LOGON : IReceiveProtocol
    {
        public RegistrationRec reg;

        public void Deserialize(Packet packet)
        {
            reg = new RegistrationRec();

            reg.crc = packet.ReadUInt32();
            reg.counter = packet.ReadUInt32();
            reg.userName = packet.ReadPString(32);
            reg.wizPassword = packet.ReadPString(32) ?? string.Empty;
            reg.auxFlags = packet.ReadSInt32();
            reg.puidCtr = packet.ReadUInt32();
            reg.puidCRC = packet.ReadUInt32();
            reg.demoElapsed = packet.ReadUInt32();
            reg.totalElapsed = packet.ReadUInt32();
            reg.demoLimit = packet.ReadUInt32();
            reg.desiredRoom = packet.ReadSInt16();
            reg.reserved = packet.getData(6, 0, true).GetString();
            reg.ulRequestedProtocolVersion = packet.ReadUInt32();
            reg.ulUploadCaps = packet.ReadUInt32();
            reg.ulDownloadCaps = packet.ReadUInt32();
            reg.ul2DEngineCaps = packet.ReadUInt32();
            reg.ul2DGraphicsCaps = packet.ReadUInt32();
            reg.ul3DEngineCaps = packet.ReadUInt32();
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

            reg = new RegistrationRec();

            reg.crc = (UInt32)(Int32)jsonResponse.reg.crc;
            reg.counter = (UInt32)(Int32)jsonResponse.reg.counter;
            reg.userName = jsonResponse.reg.userName;
            reg.wizPassword = jsonResponse.reg.wizPassword ?? string.Empty;
            reg.auxFlags = jsonResponse.reg.auxFlags;
            reg.puidCtr = (UInt32)(Int32)jsonResponse.reg.puidCtr;
            reg.puidCRC = (UInt32)(Int32)jsonResponse.reg.puidCRC;
            reg.desiredRoom = jsonResponse.reg.desiredRoom;
            reg.reserved = jsonResponse.reg.reserved;
            reg.ulRequestedProtocolVersion = jsonResponse.reg.ulRequestedProtocolVersion;
            reg.ulUploadCaps = (UInt32)(Int32)jsonResponse.reg.ulUploadCaps;
            reg.ulDownloadCaps = (UInt32)(Int32)jsonResponse.reg.ulDownloadCaps;
            reg.ul2DEngineCaps = (UInt32)(Int32)jsonResponse.reg.ul2DEngineCaps;
            reg.ul2DGraphicsCaps = (UInt32)(Int32)jsonResponse.reg.ul2DGraphicsCaps;
            reg.ul3DEngineCaps = (UInt32)(Int32)jsonResponse.reg.ul3DEngineCaps;
        }
    }
}
