using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("wprs")]
    public struct MSG_USERENTER : IReceiveProtocol
    {
        public void Deserialize(Packet packet)
        {

        }

        public void DeserializeJSON(string json)
        {

        }
    }
}
