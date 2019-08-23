using System.ComponentModel;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("endr")]
    public struct MSG_ROOMDESCEND : ISendProtocol
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
