using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("NOOP")]
    public struct MSG_NOOP : IReceiveProtocol
    {
        public void Deserialize(Packet packet)
        {

        }

        public void DeserializeJSON(string json)
        {

        }
    }
}
