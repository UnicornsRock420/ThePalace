using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Server.Commands
{
    [AdminOnlyCommand]
    public class CMD_BANLIST : ICommand
    {
        public const string Help = @"-- Display a list of the currently banned users.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = UserID != 0xFFFFFFFF ? SessionManager.sessionStates[UserID] : null;
            var xtlk = new MSG_XTALK();

            var banrecs = dbContext.Bans.AsNoTracking()
                .ToList();

            if (banrecs.Count > 0)
            {
                banrecs
                    .ForEach(banrec =>
                    {
                        var regRec = new RegistrationRec
                        {
                            counter = (UInt32)banrec.RegCtr,
                            crc = (UInt32)banrec.RegCrc,
                            puidCtr = (UInt32)banrec.Puidctr,
                            puidCRC = (UInt32)banrec.Puidcrc,
                        };

                        var regCode = Cipher.RegRectoSeed(regRec);
                        var puidCode = Cipher.RegRectoSeed(regRec, true);

                        xtlk.text = $"; {{{banrec.Ipaddress}}} {regCode} {puidCode}: {banrec.Note}";

                        if (UserID == 0xFFFFFFFF)
                        {
                            Logger.ConsoleLog(xtlk.text);
                        }
                        else
                        {
                            sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
                        }
                    });
            }
            else
            {
                xtlk.text = "There are currently no bans to list...";

                if (UserID == 0xFFFFFFFF)
                {
                    Logger.ConsoleLog(xtlk.text);
                }
                else
                {
                    sessionState.Send(xtlk, EventTypes.MSG_XTALK, 0);
                }
            }

            return true;
        }
    }
}
