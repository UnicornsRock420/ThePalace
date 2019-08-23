using System.ComponentModel;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("sAst")]
    public struct MSG_ASSETSEND : ISendProtocol
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
