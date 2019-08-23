namespace ThePalace.Core.Interfaces
{
    public interface ISendProtocol
    {
        byte[] Serialize(object input = null);

        string SerializeJSON(object input = null);
    }
}
