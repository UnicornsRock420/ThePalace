using System.ComponentModel;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("sFil")]
    public struct MSG_FILESEND : ISendProtocol
    {
        public byte[] Serialize(object input = null)
        {
            return null;
        }

        public string SerializeJSON(object input = null)
        {
            return string.Empty;
        }
    }
}
