using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Commands
{
    [AdminOnlyCommand]
    public class CMD_PURGEPROPS : ICommand
    {
        private const string help = @"-- Purge Props from Server.";

        public static string Help => help;

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = UserID != 0xFFFFFFFF ? SessionManager.sessionStates[UserID] : null;

            var xtlk = new MSG_XTALK
            {
                text = $"Purging Props",
            };

            if (args.Length <= 0)
            {
                xtlk.text = $"Clearing Room[{sessionState.RoomID}] Loose Props, issued by [{sessionState.UserID}] {sessionState.details.name}";

                SessionManager.SendToStaff(xtlk, EventTypes.MSG_XTALK, 0);
                Logger.ConsoleLog(xtlk.text);

                dbContext.LooseProps2.RemoveRange(dbContext.LooseProps2.AsNoTracking().Where(m => m.RoomId == sessionState.RoomID).ToList());

            }
            else
            {
                for (int i = 0; i < args.Length; i++)
                {
                    var arg = args[i];

                    if (!arg.Substring(0, 1).Equals("-"))
                    {

                        xtlk.text = "Invalid Paramters for PurgeProps specified";

                        if (UserID != 0xFFFFFFFF)
                        {
                            SessionManager.SendToUserID(sessionState.UserID, xtlk, EventTypes.MSG_XTALK, 0);
                        }

                        Logger.ConsoleLog(xtlk.text);
                        break;
                    }

                    if (arg.Contains("T"))
                    {
                        if ((i + 1) >= args.Length)
                        {
                            xtlk.text = "[T]ime Operation requires a DateTime string to be passed";

                            if (UserID != 0xFFFFFFFF)
                            {
                                SessionManager.SendToUserID(sessionState.UserID, xtlk, EventTypes.MSG_XTALK, 0);
                            }

                            Logger.ConsoleLog(xtlk.text);
                            break;
                        }

                        var time = args[i + 1].TryParse<DateTime>();

                        if (!time.HasValue)
                        {
                            xtlk.text = "Invalid DateTime format";

                            if (UserID != 0xFFFFFFFF)
                            {
                                SessionManager.SendToUserID(sessionState.UserID, xtlk, EventTypes.MSG_XTALK, 0);
                            }

                            Logger.ConsoleLog("Invalid DateTime format");
                            return true;
                        }

                        xtlk.text = $"Removing Props Older than {time.ToString()}, issued by [{sessionState.UserID}] {sessionState.details.name}";
                        SessionManager.SendToStaff(xtlk, EventTypes.MSG_XTALK, 0);
                        Logger.ConsoleLog(xtlk.text);
                        dbContext.Assets.RemoveRange(dbContext.Assets.AsNoTracking().Where(m => m.LastUsed <= time));
                        i++;
                        break;
                    }
                    else if (arg.Contains("C"))
                    {
                        xtlk.text = $"Removing All Cached Props, issued by [{sessionState.UserID}] {sessionState.details.name}";
                        SessionManager.SendToStaff(xtlk, EventTypes.MSG_XTALK, 0);
                        Logger.ConsoleLog(xtlk.text);

                        dbContext.Assets.RemoveRange(dbContext.Assets);
                        break;
                    }

                    if (arg.Contains("L"))
                    {
                        xtlk.text = $"Purging All Loose Props, issued by [{sessionState.UserID}] {sessionState.details.name}";
                        SessionManager.SendToStaff(xtlk, EventTypes.MSG_XTALK, 0);
                        Logger.ConsoleLog(xtlk.text);
                        dbContext.LooseProps.RemoveRange(dbContext.LooseProps);
                        break;
                    }
                }
            }

            dbContext.SaveChanges();

            return true;
        }
    }
}
