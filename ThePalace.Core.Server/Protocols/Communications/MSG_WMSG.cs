using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("wmsg")]
    public struct MSG_WMSG : IReceiveProtocol
    {
        public void Deserialize(Packet packet)
        {

        }

        public void DeserializeJSON(string json)
        {

        }
    }
}
