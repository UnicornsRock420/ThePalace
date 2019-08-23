using ThePalace.Core.Factories;

namespace ThePalace.Core.Interfaces
{
    public interface IReceiveProtocol : IProtocol
    {
        void Deserialize(Packet packet);

        void DeserializeJSON(string json);
    }
}
