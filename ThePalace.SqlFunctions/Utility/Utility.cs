using System.Data.SqlTypes;

public class Utility
{
    public static SqlString GetHex(SqlInt32 source)
    {
        return string.Format("0x{0:X8}", source.IsNull ? 0 : source.Value);
    }
}
