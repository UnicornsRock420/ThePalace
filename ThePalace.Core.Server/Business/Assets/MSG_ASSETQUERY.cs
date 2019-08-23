using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("qAst")]
    public struct MSG_ASSETQUERY : IReceiveBusiness
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

            var inboundPacket = (Protocols.MSG_ASSETQUERY)protocol;

            if (inboundPacket.assetSpec.id != 0)
            {
                Logger.Log(MessageTypes.Info, $"MSG_ASSETQUERY[{sessionState.UserID}]: {inboundPacket.assetSpec.id}, {inboundPacket.assetSpec.crc}");

                AssetLoader.OutboundQueueTransfer(sessionState, inboundPacket.assetSpec);
            }
        }
    }
}
