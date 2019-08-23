using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Commands
{
    [AdminOnlyCommand]
    public class CMD_BAN : ICommand
    {
        private const string help = @"[<target user>] or [<IP|REG|PUID>] -- Permanently ban <target user> from the server.";

        public static string Help => help;

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = UserID != 0xFFFFFFFF ? SessionManager.sessionStates[UserID] : null;
            var xtlk = new MSG_XTALK();

            if (TargetID == 0 && args.Length < 1)
            {
                xtlk.text = "A target user or parameter is required for this command.";
            }

            if (TargetID != 0)
            {
                var targetSessionState = SessionManager.sessionStates[TargetID];

                if (targetSessionState.Authorized)
                {
                    xtlk.text = "Sorry, you may not perform this command on another staff member.";

                    sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
                }
                else
                {
                    var ipAddress = targetSessionState.driver.GetIPAddress();
                    var serverDown = new Business.MSG_SERVERDOWN
                    {
                        reason = ServerDownFlags.SD_Banished,
                        whyMessage = "You have been banned!",
                    };

                    SessionManager.sessionStates.Values.ToList().ForEach(state =>
                    {
                        if (state.driver.GetIPAddress() == ipAddress)
                        {
                            serverDown.Send(dbContext, new Message
                            {
                                sessionState = state,
                            });

                            state.driver.DropConnection();
                        }

                        dbContext.Bans.Add(new Bans
                        {
                            Ipaddress = ipAddress,
                            RegCtr = (Int32)state.reg.counter,
                            RegCrc = (Int32)state.reg.crc,
                            Puidctr = (Int32)state.reg.puidCtr,
                            Puidcrc = (Int32)state.reg.puidCRC,
                            Note = state.details.name,
                            UntilDate = null,
                        });
                    });
                }
            }

            if (args != null && args.Length > 0)
            {
                var bans = new List<Bans>();
                var serverDown = new Business.MSG_SERVERDOWN
                {
                    reason = ServerDownFlags.SD_Banished,
                    whyMessage = "You have been banned!",
                };

                foreach (var _arg in args)
                {
                    var arg = _arg.Trim();

                    if (Regex.IsMatch(arg, "^[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+$"))
                    {
                        bans.Add(new Bans
                        {
                            Ipaddress = arg,
                            UntilDate = null,
                        });
                    }

                    if (Regex.IsMatch(arg, @"^[\{]*[A-Q][\}]*$"))
                    {
                        var seed = Cipher.WizKeytoSeed(arg);
                        var crc = Cipher.ComputeLicenseCrc((UInt32)seed);
                        var ctr = Cipher.GetSeedFromReg((UInt32)seed, crc);

                        bans.Add(new Bans
                        {
                            RegCrc = (Int32)crc,
                            RegCtr = ctr,
                            UntilDate = null,
                        });
                    }

                    if (Regex.IsMatch(arg, @"^[\{]*[Z][A-Q][\}]*$"))
                    {
                        var seed = Cipher.WizKeytoSeed(arg);
                        var crc = Cipher.ComputeLicenseCrc((UInt32)seed);
                        var ctr = Cipher.GetSeedFromPUID((UInt32)seed, crc);

                        bans.Add(new Bans
                        {
                            Puidcrc = (Int32)crc,
                            Puidctr = ctr,
                            UntilDate = null,
                        });
                    }
                }

                SessionManager.sessionStates.Values.ToList().ForEach(state =>
                {
                    foreach (var ban in bans)
                    {
                        if (state.driver.GetIPAddress() == ban.Ipaddress ||
                            (state.reg.crc == ban.RegCrc && state.reg.counter == ban.RegCtr) ||
                            (state.reg.puidCRC == ban.Puidcrc && state.reg.puidCtr == ban.Puidctr))
                        {
                            ban.Note = state.details.name;

                            serverDown.Send(dbContext, new Message
                            {
                                sessionState = state,
                            });

                            state.driver.DropConnection();
                        }
                    }
                });

                if (bans.Count > 0)
                {
                    dbContext.Bans.AddRange(bans);
                }
            }

            if (dbContext.HasUnsavedChanges())
            {
                dbContext.SaveChanges();

                xtlk.text = "Ban record(s) added...";
            }
            else
            {
                xtlk.text = "Usage: `ban [<target user>] or [<IP|REG|PUID>]";
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
