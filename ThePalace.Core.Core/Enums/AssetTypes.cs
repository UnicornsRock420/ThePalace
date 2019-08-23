using System;

namespace ThePalace.Core.Enums
{
    public enum LegacyAssetTypes : Int32
    {
        RT_PROP = 0x50726F70,
        RT_USERBASE = 0x55736572,
        RT_IPUSERBASE = 0x49557372,
    }

    [Flags]
    public enum AssetFlags : byte
    {
        AssetModified = 0x01,
        AssetLoaded = 0x02,
        AssetPurgeable = 0x04,
        AssetProtected = 0x08,
        AssetInTempFile = 0x10,
    }

    [Flags]
    public enum ServerAssetFlags : UInt32
    {
        HighResProp = 0x01,
    }
}
