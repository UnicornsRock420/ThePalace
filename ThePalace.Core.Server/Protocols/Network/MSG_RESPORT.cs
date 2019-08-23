using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("resp")]
    public struct MSG_RESPORT : IReceiveProtocol
    {
        public void Deserialize(Packet packet)
        {

        }

        public void DeserializeJSON(string json)
        {

        }
    }
}
