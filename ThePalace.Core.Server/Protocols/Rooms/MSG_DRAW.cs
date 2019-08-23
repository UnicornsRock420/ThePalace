using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;

namespace ThePalace.Server.Protocols
{
    [Description("draw")]
    public struct MSG_DRAW : IReceiveProtocol, ISendProtocol
    {
        public DrawCmdRec command;

        public void Deserialize(Packet packet)
        {
            command = new DrawCmdRec();
            command.nextOfst = packet.ReadSInt16();
            command.reserved = packet.ReadSInt16();
            command.drawCmd = packet.ReadSInt16();
            command.cmdLength = packet.ReadUInt16();
            command.dataOfst = packet.ReadSInt16();
            command.data = packet.getData(command.cmdLength, 0, true);
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt16(command.nextOfst);
                packet.WriteInt16(command.reserved);
                packet.WriteInt16(command.drawCmd);
                packet.WriteInt16(command.cmdLength);
                packet.WriteInt16(command.dataOfst);
                packet.AppendBytes(command.data);

                return packet.getData();
            }
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                command = new DrawCmdRec
                {
                    type = jsonResponse.type,
                    layer = jsonResponse.layer,
                    data = ((string)jsonResponse.data ?? string.Empty).ReadPalaceString(),
                };
            }
            catch
            {
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                type = command.type.ToString(),
                layer = command.layer,
                data = command.data.WritePalaceString(),
            });
        }
    }
}
