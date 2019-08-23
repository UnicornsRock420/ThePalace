using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{

    [Description("sAst")]
    public struct MSG_ASSETSEND : ISendBusiness
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var assetState = ((Message)message).assetState;

            sessionState.Send(assetState.assetStream, EventTypes.MSG_ASSETSEND, 0);
        }
    }
}
