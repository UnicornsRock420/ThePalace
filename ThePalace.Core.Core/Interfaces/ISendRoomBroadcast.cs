using ThePalace.Core.Database;

namespace ThePalace.Core.Interfaces
{
    public interface ISendRoomBusiness
    {
        void SendToRoomID(ThePalaceEntities dbContext, object message);
    }
}
