using System;
using System.Collections.Generic;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Business;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Commands
{
    [AdminOnlyCommand]
    public class CMD_DELETEROOM : ICommand
    {
        public const string Help = @"[<ID>] -- Delete a room.";

        public bool Command(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, params string[] args)
        {
            var sessionState = UserID != 0xFFFFFFFF ? SessionManager.sessionStates[UserID] : null;
            var roomID = (args.Length > 0 ? args[0].TryParse<Int16>() : null) ?? sessionState?.RoomID ?? 0;

            if (roomID > 0)
            {
                var roomUsers = SessionManager.sessionStates.Values
                    .Where(s => s.RoomID == roomID)
                    .ToList();
                var room = dbContext.GetRoom(roomID);

                if (!room.NotFound)
                {
                    room.Delete(dbContext);
                }

                var sendBusinesses = new List<ISendBusiness>
                {
                    new MSG_ROOMDESC(),
                    new MSG_USERLIST(),
                    new MSG_ROOMDESCEND(),
                };
                var userNew = new MSG_USERNEW();

                foreach (var roomUser in roomUsers)
                {
                    roomID = dbContext.FindRoomID(0, roomUser.Authorized);
                    room = dbContext.GetRoom(roomID);

                    if (!room.NotFound)
                    {
                        roomUser.RoomID = room.ID;

                        foreach (var sendBusiness in sendBusinesses)
                        {
                            sendBusiness.Send(dbContext, new Message
                            {
                                sessionState = roomUser,
                            });
                        }

                        userNew.SendToRoomID(dbContext, new Message
                        {
                            sessionState = roomUser,
                        });
                    }
                }

                Logger.Log(MessageTypes.Info, $"CMD_DELETEROOM[{sessionState?.AuthUserID ?? -1}]: {room.Name}");
            }

            return true;
        }
    }
}
