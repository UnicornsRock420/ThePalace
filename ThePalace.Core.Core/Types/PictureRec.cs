using Newtonsoft.Json;
using System;

namespace ThePalace.Core.Types
{
    public class PictureRec
    {
        [JsonIgnore]
        public Int32 refCon;
        public Int16 picID;
        [JsonIgnore]
        public Int16 picNameOfst;
        public Int16 transColor;
        [JsonIgnore]
        public Int16 reserved;

        public string name;

        public static int SizeOf
        {
            get => 12;
        }
    }
}
