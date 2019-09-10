using System.ComponentModel;
using ThePalace.Core.Constants;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Types;

namespace ThePalace.Server.Protocols
{
    [Description("rAst")]
    public struct MSG_ASSETREGI : IReceiveProtocol
    {
        public AssetRec assetRec;

        public void Deserialize(Packet packet)
        {
            assetRec = new AssetRec();
            packet.DropBytes(4); //assetRec.type = (LegacyAssetTypes)packet.ReadSInt32();
            assetRec.propSpec = new AssetSpec(packet);
            assetRec.blockSize = packet.ReadUInt32();
            assetRec.blockOffset = packet.ReadSInt32();
            assetRec.blockNbr = packet.ReadUInt16();
            assetRec.nbrBlocks = packet.ReadUInt16();

            if (assetRec.blockNbr < 1)
            {
                assetRec.flags = packet.ReadUInt32();
                assetRec.size = packet.ReadUInt32();
                assetRec.name = packet.ReadPString(32);

                if (assetRec.blockSize > assetRec.size || assetRec.blockSize > NetworkConstants.ASSET_MAX_BLOCK_SIZE || assetRec.blockSize < 0 || assetRec.size < 1 || assetRec.size > NetworkConstants.ASSET_MAX_BLOCK_SIZE)
                {
                    return;
                }

                assetRec.data = packet.getData((int)assetRec.blockSize);
            }
        }

        public void DeserializeJSON(string json)
        {

        }
    }
}
