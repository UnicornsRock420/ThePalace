using System;
using System.Collections.Generic;

namespace ThePalace.Core.Database
{
    public partial class Assets1
    {
        public int UserId { get; set; }
        public byte AssetIndex { get; set; }
        public int AssetId { get; set; }
        public int AssetCrc { get; set; }
    }
}
