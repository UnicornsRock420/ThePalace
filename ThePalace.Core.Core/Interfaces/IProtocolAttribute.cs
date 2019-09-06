using System.Collections.Generic;

namespace ThePalace.Core.Interfaces
{
    public interface IProtocolAttribute
    {
        bool OnBeforeProtocolExecute(Dictionary<string, object> contextValues);
    }
}
