using System;

namespace ThePalace.Server.Web.Models
{
    public class PropWSGetResponseProp
    {
        public Int32 id;
        public UInt32 crc;
        public string flags;
        public string name;
        public string format;
        public bool success;
        public PropWSGetResponseSize size;
        public PropWSGetResponseOffset offsets;
    }
}
