using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Authorization
{
    public static class AuthEngine
    {
        public static void AuthorizeUser(ThePalaceEntities dbContext, object message, out int AuthUserID, out List<int> AuthRoleIDs, out List<int> AuthMsgIDs, out List<string> AuthCmds)
        {
            var sessionState = ((Message)message).sessionState;
            var protocol = ((Message)message).protocol;

            var ipAddress = sessionState.driver.GetIPAddress();
            var xTalkB = new Business.MSG_XTALK();
            var xTalkP = new MSG_XTALK();
            var authUserID = 0;

            var actions = new Dictionary<Type, Action>
            {
                { typeof(MSG_LOGON), () => {
                    var inboundPacket = (MSG_LOGON)protocol;

                    authUserID = dbContext.Auth.AsNoTracking()
                        .AsEnumerable()
                        .Where(a =>
                            (a.AuthType == (byte)AuthTypes.Password && a.Value.Trim() == (inboundPacket.reg.wizPassword ?? string.Empty).Trim()) ||
                            (a.AuthType == (byte)AuthTypes.IPAddress && a.Value.Trim() == ipAddress) ||
                            (a.AuthType == (byte)AuthTypes.RegCode && a.Ctr.HasValue && a.Crc.HasValue && a.Ctr.Value == inboundPacket.reg.counter && a.Crc.Value == inboundPacket.reg.crc) ||
                            (a.AuthType == (byte)AuthTypes.PUID && a.Ctr.HasValue && a.Crc.HasValue && a.Ctr.Value == inboundPacket.reg.puidCtr && a.Crc.Value == inboundPacket.reg.puidCRC))
                        .Select(a => a.UserId)
                        .FirstOrDefault();

                    if (authUserID > 0)
                    {
                        xTalkP.text = $"{sessionState.details.name} ({sessionState.UserID}) [{ipAddress}] is now authorized!";

                        Logger.Log(MessageTypes.Info, xTalkP.text);

                        xTalkB.SendToUserID(dbContext, new Message
                        {
                            sessionState = sessionState,
                            protocol = xTalkP,
                        });

                        xTalkB.SendToStaff(dbContext, new Message
                        {
                            sessionState = sessionState,
                            protocol = xTalkP,
                        });
                    }
                } },
                { typeof(MSG_SUPERUSER), () => {
                    var inboundPacket = (MSG_SUPERUSER)protocol;

                    authUserID = dbContext.Auth.AsNoTracking()
                        .AsEnumerable()
                        .Where(a =>
                            (a.AuthType == (byte)AuthTypes.Password && a.Value.Trim() == (inboundPacket.password ?? string.Empty).Trim()) ||
                            (a.AuthType == (byte)AuthTypes.IPAddress && a.Value.Trim() == ipAddress) ||
                            (a.AuthType == (byte)AuthTypes.RegCode && a.Ctr.HasValue && a.Crc.HasValue && a.Ctr == sessionState.reg.counter && a.Crc == sessionState.reg.crc) ||
                            (a.AuthType == (byte)AuthTypes.PUID && a.Ctr.HasValue && a.Crc.HasValue && a.Ctr == sessionState.reg.puidCtr && a.Crc == sessionState.reg.puidCRC))
                        .Select(a => a.UserId)
                        .FirstOrDefault();

                    if (authUserID > 0)
                    {
                        xTalkP.text = $"{sessionState.details.name} ({sessionState.UserID}) [{ipAddress}] is now authorized!";

                        xTalkB.SendToUserID(dbContext, new Message
                        {
                            sessionState = sessionState,
                            protocol = xTalkP,
                        });
                    }
                    else
                    {
                        xTalkP.text = $"{sessionState.details.name} ({sessionState.UserID}) [{ipAddress}] attempted authorization and failed...";
                    }

                    Logger.Log(MessageTypes.Info, xTalkP.text);

                    xTalkB.SendToStaff(dbContext, new Message
                    {
                        sessionState = sessionState,
                        protocol = xTalkP,
                    });
                } },
                { typeof(MSG_AUTHRESPONSE), () => {
                    var inboundPacket = (MSG_AUTHRESPONSE)protocol;

                    authUserID = dbContext.Auth.AsNoTracking()
                        .Where(a =>
                            (a.AuthType == (byte)AuthTypes.Password && a.Value.Trim() == inboundPacket.password.Trim()))
                        .Join(
                            dbContext.Users.AsNoTracking(),
                            a => a.UserId,
                            u => u.UserId,
                            (a, u) => new {a, u}
                        )
                        .Where(u => u.u.Name == inboundPacket.userName.Trim())
                        .Select(a => a.a.UserId)
                        .FirstOrDefault();

                    if (authUserID > 0)
                    {
                        xTalkP.text = $"{sessionState.details.name} ({sessionState.UserID}) [{ipAddress}] is now authorized!";

                        xTalkB.SendToUserID(dbContext, new Message
                        {
                            sessionState = sessionState,
                            protocol = xTalkP,
                        });
                    }
                    else
                    {
                        xTalkP.text = $"{sessionState.details.name} ({sessionState.UserID}) [{ipAddress}] attempted authorization and failed...";
                    }

                    Logger.Log(MessageTypes.Info, xTalkP.text);

                    xTalkB.SendToStaff(dbContext, new Message
                    {
                        sessionState = sessionState,
                        protocol = xTalkP,
                    });
                } }
            };

            var type = protocol.GetType();

            if (type != null && actions.ContainsKey(type))
            {
                actions[type]();
            }

            if (authUserID > 0)
            {
                AuthUserID = authUserID;
                AuthRoleIDs = dbContext.GroupUsers.AsNoTracking()
                    .Where(gu => gu.UserId == authUserID)
                    .Join(
                        dbContext.GroupRoles.AsNoTracking(),
                        gu => gu.GroupId,
                        gr => gr.GroupId,
                        (gu, gr) => new { gu, gr }
                    )
                    .Select(g => g.gr.RoleId)
                    .Distinct()
                    .ToList();
                AuthMsgIDs = new List<int>();
                AuthCmds = new List<string>();

                sessionState.userFlags |= (short)(UserFlags.U_SuperUser | UserFlags.U_God);

                if (sessionState.successfullyConnected)
                {
                    var uSta = new MSG_USERSTATUS
                    {
                        flags = sessionState.userFlags,
                    };

                    sessionState.Send(uSta, EventTypes.MSG_USERSTATUS, (Int32)sessionState.UserID);
                }
            }
            else
            {
                AuthUserID = 0;
                AuthRoleIDs = null;
                AuthMsgIDs = null;
                AuthCmds = null;
            }
        }
    }
}
