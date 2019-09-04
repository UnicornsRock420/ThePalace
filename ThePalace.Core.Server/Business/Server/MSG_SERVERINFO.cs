using System.ComponentModel;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Core;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("sinf")]
    public struct MSG_SERVERINFO : ISendBusiness, ISendBroadcast
    {
        public void Send(ThePalaceEntities dbContext, object message)
        {
            // Send Server Info 'sinf'
            var outboundPacket = new Protocols.MSG_SERVERINFO
            {
                serverName = ServerState.serverName,
                serverPermissions = ServerState.serverPermissions,
                //ulDownloadCaps = 0,
                //serverOptions = 0,
                //ulUploadCaps = 0,
            };

            SessionManager.SendToServer(outboundPacket, EventTypes.MSG_SERVERINFO, 0);
        }

        public void SendToServer(ThePalaceEntities dbContext, object message)
        {
            // Send Server Info 'sinf'
            var outboundPacket = new Protocols.MSG_SERVERINFO
            {
                serverName = ServerState.serverName,
                serverPermissions = ServerState.serverPermissions,
                //ulDownloadCaps = 0,
                //serverOptions = 0,
                //ulUploadCaps = 0,
            };

            SessionManager.SendToServer(outboundPacket, EventTypes.MSG_SERVERINFO, 0);
        }
    }
}
