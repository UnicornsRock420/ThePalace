using System;
using ThePalace.Core.Database;
using ThePalace.Server.Core;
using ThePalace.Server.Factories;

namespace ThePalace.Core.Utility
{
    public static class UtilityExtensionMethods
    {
        public static RoomBuilder GetRoom(this ThePalaceEntities dbContext, Int16 roomID)
        {
            var room = (RoomBuilder)null;

            if (ServerState.roomsCache.ContainsKey(roomID))
            {
                room = ServerState.roomsCache[roomID];
            }
            else
            {
                room = new RoomBuilder();

                if (room == null)
                {
                    throw new OutOfMemoryException("Unable to initiate RoomBuilder instance.");
                }

                room.ID = roomID;

                room.Read(dbContext);

                if (!room.NotFound)
                {
                    lock (ServerState.roomsCache)
                    {
                        ServerState.roomsCache.TryAdd(room.ID, room);
                    }
                }
            }

            return room;
        }
    }
}
