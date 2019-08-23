using ThePalace.Core.Database;

namespace ThePalace.Core.Interfaces
{
    public interface IReceiveBusiness
    {
        void Receive(ThePalaceEntities dbContext, object message);
    }
}
