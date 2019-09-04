using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Core;
using ThePalace.Server.Factories;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("rAst")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_ASSETREGI : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_ASSETREGI)protocol;

            if (inboundPacket.assetRec.propSpec.id != 0)
            {
                Logger.Log(MessageTypes.Info, $"MSG_ASSETREGI[{sessionState.UserID}]: {inboundPacket.assetRec.propSpec.id}, {inboundPacket.assetRec.propSpec.crc}");

                var assetStream = new AssetStream(inboundPacket.assetRec);

                AssetLoader.AppendInboundChunk(sessionState, assetStream);

                ThreadController.manageAssetsInboundQueueSignalEvent.Set();
            }
        }
    }
}
