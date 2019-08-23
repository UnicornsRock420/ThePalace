using Newtonsoft.Json;
using System;

namespace ThePalace.Core.Types
{
    public class HotspotStateRec
    {
        public Int16 pictID;
        [JsonIgnore]
        public Int16 reserved;
        public Point picLoc;

        public static int SizeOf
        {
            get => 8;
        }
    }
}
