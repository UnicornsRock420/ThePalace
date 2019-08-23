using Newtonsoft.Json;
using System.ComponentModel;
using System.Reflection;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Protocols
{
    [Description("vers")]
    public struct MSG_VERSION : ISendProtocol
    {
        public byte[] Serialize(object input = null)
        {
            return null;
        }

        public string SerializeJSON(object input = null)
        {
            var version = Assembly.GetExecutingAssembly().GetName().Version;

            return JsonConvert.SerializeObject(new
            {
                major = version.Major,
                minor = version.Minor,
                revision = version.Revision,
                build = version.Build,
            });
        }
    }
}
