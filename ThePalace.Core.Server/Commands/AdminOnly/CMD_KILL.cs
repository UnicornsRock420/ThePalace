using System;
using System.Linq;
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
    public class CMD_KILL : ICommand
    {
        public const string Help = @"[<user>] -- Kill a currently connected user.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = SessionManager.sessionStates[UserID];
            var xtlk = new MSG_XTALK();

            if (TargetID == 0)
            {
                xtlk.text = "Sorry, you must target a user to use this command.";

                sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
            }
            else
            {
                var targetSessionState = SessionManager.sessionStates[TargetID];

                if (targetSessionState.Authorized)
                {
                    xtlk.text = "Sorry, you may not perform this command on another staff member.";

                    sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
                }
                else
                {
                    var killDuration_InMinutes = ConfigManager.GetValue<Int16>("KillDuration_InMinutes", 10).Value;
                    var killDuration_DT = DateTime.UtcNow.AddMinutes(killDuration_InMinutes);

                    var ipAddress = targetSessionState.driver.GetIPAddress();
                    var serverDown = new Business.MSG_SERVERDOWN
                    {
                        reason = ServerDownFlags.SD_KilledBySysop,
                        whyMessage = "You have been dispatched!",
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
                            UntilDate = killDuration_DT,
                        });
                    });
                }
            }

            return true;
        }
    }
}
