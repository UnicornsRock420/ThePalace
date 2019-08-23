using ThePalace.Core.Database;

namespace ThePalace.Core.Interfaces
{
    public interface ISendBroadcast
    {
        void SendToServer(ThePalaceEntities dbContext, object message);
    }
}
