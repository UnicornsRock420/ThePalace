using System.ComponentModel;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("auth")]
    public struct MSG_AUTHENTICATE : ISendProtocol
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
