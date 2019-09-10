using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Types;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace ThePalace.Server.Protocols
{
    [Description("qAst")]
    public struct MSG_ASSETQUERY : IReceiveProtocol, ISendProtocol
    {
        public LegacyAssetTypes assetType;
        public AssetSpec assetSpec;

        public void Deserialize(Packet packet)
        {
            assetType = (LegacyAssetTypes)packet.ReadSInt32();
            assetSpec = new AssetSpec(packet);
        }

        public byte[] Serialize(object input = null)
        {
            using (var packet = new Packet())
            {
                packet.WriteInt32((int)assetType);
                packet.AppendBytes(assetSpec.Serialize());

                return packet.getData();
            }
        }

        public void DeserializeJSON(string json)
        {
            var jsonResponse = (dynamic)null;

            try
            {
                jsonResponse = (dynamic)JsonConvert.DeserializeObject<JObject>(json);

                assetType = (LegacyAssetTypes)jsonResponse.assetType;
                assetSpec = new AssetSpec(jsonResponse.assetSpec.id, jsonResponse.assetSpec.crc);
            }
            catch
            {
            }
        }

        public string SerializeJSON(object input = null)
        {
            return JsonConvert.SerializeObject(new
            {
                assetType = assetType.ToString(),
                assetSpec = assetSpec,
            });
        }
    }
}
