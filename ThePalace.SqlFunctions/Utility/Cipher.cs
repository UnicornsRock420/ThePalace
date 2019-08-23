using System;
using System.Data.SqlTypes;
using ThePalace.Constants;

public class Cipher
{
    public static SqlInt32 ComputeCrc(SqlBytes ptr, SqlInt32 offset, SqlBoolean isAsset)
    {
        Func<uint, uint, uint> getCrc = (_crc, _ptr) =>
        {
            return (uint)((uint)(_crc << 1) | (uint)((_crc & 0x80000000) != 0 ? 1 : 0)) ^ _ptr;
        };

        var j = (offset.IsNull ? 0 : offset.Value);
        var len = ptr.Length - j;
        var crc = (UInt32)0;

        if (isAsset)
        {
            crc = AssetConstants.CRC_MAGIC;
        }
        else
        {
            crc = RegConstants.CRC_MAGIC;
        }

        while (len-- > 0)
        {
            if (isAsset)
            {
                crc = getCrc(crc, ptr[j++]);
            }
            else
            {
                crc = getCrc(crc, CrcMagic.gCrcMask[ptr[j++]]);
            }
        }

        return new SqlInt32((int)crc);
    }
}
