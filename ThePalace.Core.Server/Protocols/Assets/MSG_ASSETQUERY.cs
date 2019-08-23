using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Types;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;

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
                packet.WriteInt32((int)LegacyAssetTypes.RT_PROP);
                packet.AppendBytes(assetSpec.Serialize());

                return packet.getData();
            }
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
