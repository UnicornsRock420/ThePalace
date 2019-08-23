using System;
using ThePalace.Core.Database;

namespace ThePalace.Core.Interfaces
{
    public interface ISendUserBusiness
    {
        void SendToUser(ThePalaceEntities dbContext, object message, UInt32 TargetID);
    }
}
