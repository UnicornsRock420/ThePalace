using System;
using ThePalace.Core.Database;

namespace ThePalace.Core.Interfaces
{
    public interface ICommand
    {
        bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args);
    }
}
