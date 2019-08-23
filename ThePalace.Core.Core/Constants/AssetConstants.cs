using System;

namespace ThePalace.Core.Constants
{
    public static class AssetConstants
    {
        public const uint CRC_MAGIC = 0xD9216290;

        public static readonly DateTime epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        public static readonly DateTime pepoch = new DateTime(1995, 1, 1, 0, 0, 0, DateTimeKind.Utc);
    }
}
