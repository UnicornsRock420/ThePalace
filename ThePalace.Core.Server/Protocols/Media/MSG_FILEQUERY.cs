using System.ComponentModel;
using ThePalace.Core.Factories;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("qFil")]
    public struct MSG_FILEQUERY : IReceiveProtocol
    {
        public string fileName;
        public void Deserialize(Packet packet)
        {
            fileName = packet.ReadPString(packet.Count);
        }

        public void DeserializeJSON(string json)
        {

        }
    }
}
