using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Factories;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("qFil")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_FILEQUERY : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;
            var inboundPacket = (Protocols.MSG_FILEQUERY)protocol;

            if (!string.IsNullOrWhiteSpace(inboundPacket.fileName))
            {
                Logger.Log(MessageTypes.Info, $"MSG_FILEQUERY[{sessionState.UserID}]: {inboundPacket.fileName}");

                MediaStream media = new MediaStream(inboundPacket.fileName);

                if (media.Open() && media.hasData)
                {
                    FileLoader.QueueTransfer(sessionState, media);
                }
                else if (!media.FileExists)
                {
                    new MSG_FILENOTFND().Send(dbContext, message);
                }
            }
        }
    }
}
