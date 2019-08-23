using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Plugins.Protocols
{
    public class MSG_TEST : IReceiveProtocol
    {
        public void Deserialize(Packet packet)
        {
            return;
        }

        public void DeserializeJSON(string json)
        {
            return;
        }
    }
}
