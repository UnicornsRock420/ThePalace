using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("eprs")]
    public struct MSG_USEREXIT : IReceiveProtocol
    {
        public void Deserialize(Packet packet)
        {

        }

        public void DeserializeJSON(string json)
        {

        }
    }
}
