using ThePalace.Core.Interfaces;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Models
{
    public class Message
    {
        public SessionState sessionState;
        public MediaState mediaState;
        public AssetState assetState;
        public Header header;
        public IReceiveProtocol protocol;
    }
}
