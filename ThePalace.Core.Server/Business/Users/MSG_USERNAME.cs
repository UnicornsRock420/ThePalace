using System;
using System.ComponentModel;
using System.Text.RegularExpressions;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Business
{
    [Description("usrN")]
    [SuccessfullyConnectedProtocol]
    public struct MSG_USERNAME : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;

            if (!sessionState.Authorized)
            {
                if ((sessionState.userFlags & (int)UserFlags.U_NameGag) != 0)
                {
                    return;
                }
            }

            var inboundPacket = (Protocols.MSG_USERNAME)protocol;

            if (string.IsNullOrWhiteSpace(inboundPacket.name) || Regex.IsMatch(inboundPacket.name, @"^User\s*[0-9]+$", RegexOptions.IgnoreCase | RegexOptions.Singleline))
            {
                inboundPacket.name = $"User {sessionState.UserID}";
            }

            Logger.Log(MessageTypes.Info, $"MSG_USERNAME[{sessionState.UserID}]: {inboundPacket.name}");

            sessionState.details.name = inboundPacket.name;

            SessionManager.SendToRoomID(sessionState.RoomID, 0, inboundPacket, EventTypes.MSG_USERNAME, (Int32)sessionState.UserID);
        }
    }
}
