using System.Collections.Generic;

namespace ThePalace.Core.Interfaces
{
    public interface ICommandAttribute
    {
        bool OnBeforeCommandExecute(Dictionary<string, object> contextValues);
    }
}
