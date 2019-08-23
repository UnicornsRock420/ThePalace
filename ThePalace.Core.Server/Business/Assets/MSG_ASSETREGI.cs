using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Core;
using ThePalace.Server.Factories;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("rAst")]
    public struct MSG_ASSETREGI : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;

            if (!sessionState.successfullyConnected)
            {
                new MSG_SERVERDOWN
                {
                    reason = ServerDownFlags.SD_CommError,
                    whyMessage = "Communication Error!",
                }.Send(dbContext, message);

                sessionState.driver.DropConnection();

                return;
            }

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
