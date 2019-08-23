using ThePalace.Core.Database;

namespace ThePalace.Core.Interfaces
{
    public interface ISendBusiness
    {
        void Send(ThePalaceEntities dbContext, object message);
    }
}
