using ThePalace.Core.Database;
using ThePalace.Core.Interfaces;

namespace ThePalace.Server.Plugins.Business
{
    public class MSG_TEST : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            return;
        }
    }
}
