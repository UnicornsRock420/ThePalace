using ThePalace.Core.Database;

namespace ThePalace.Core.Interfaces
{
    public interface ISendStaffBroadcast
    {
        void SendToStaff(ThePalaceEntities dbContext, object message);
    }
}
