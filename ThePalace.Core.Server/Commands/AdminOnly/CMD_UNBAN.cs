using System;
using System.Linq;
using System.Text.RegularExpressions;
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
    public class CMD_UNBAN : ICommand
    {
        public const string Help = @"<IP|REG|PUID> -- Unban a previously banned user (see the `ban command).";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = UserID != 0xFFFFFFFF ? SessionManager.sessionStates[UserID] : null;
            var xtlk = new MSG_XTALK();

            if (args.Length < 1)
            {
                xtlk.text = "A parameter is required for this command.";
            }
            else
            {
                foreach (var _arg in args)
                {
                    var arg = _arg.Trim();

                    if (Regex.IsMatch(arg, "^[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+$"))
                    {
                        var records = dbContext.Bans
                            .Where(b => b.Ipaddress == arg)
                            .ToList();

                        if (records.Count > 0)
                        {
                            dbContext.Bans.RemoveRange(records);
                        }
                    }

                    if (Regex.IsMatch(arg, @"^[\{]*[A-Q][\}]*$"))
                    {
                        var seed = Cipher.WizKeytoSeed(arg);
                        var crc = Cipher.ComputeLicenseCrc((UInt32)seed);
                        var ctr = Cipher.GetSeedFromReg((UInt32)seed, crc);
                        var records = dbContext.Bans
                            .Where(b => b.RegCtr == ctr && b.RegCrc == crc)
                            .ToList();

                        if (records.Count > 0)
                        {
                            dbContext.Bans.RemoveRange(records);
                        }
                    }

                    if (Regex.IsMatch(arg, @"^[\{]*[Z][A-Q][\}]*$"))
                    {
                        var seed = Cipher.WizKeytoSeed(arg);
                        var crc = Cipher.ComputeLicenseCrc((UInt32)seed);
                        var ctr = Cipher.GetSeedFromPUID((UInt32)seed, crc);
                        var records = dbContext.Bans
                            .Where(b => b.Puidctr == ctr && b.Puidcrc == crc)
                            .ToList();

                        if (records.Count > 0)
                        {
                            dbContext.Bans.RemoveRange(records);
                        }
                    }
                }

                if (dbContext.HasUnsavedChanges())
                {
                    dbContext.SaveChanges();

                    xtlk.text = "Ban record(s) removed...";
                }
                else
                {
                    xtlk.text = "Unable to find ban record(s) by that criteria, try again.";
                }
            }

            if (UserID == 0xFFFFFFFF)
            {
                Logger.ConsoleLog(xtlk.text);
            }
            else
            {
                sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
            }

            return true;
        }
    }
}
