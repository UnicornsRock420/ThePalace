using System;
using System.Linq;
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

        public static bool AttributeWrapper(this Type objectType, Type attributeType, string methodName, params object[] values)
        {
            var attribute = objectType.GetCustomAttributes(attributeType, false).SingleOrDefault();
            if (attribute != null)
            {
                var cstrPtr = attributeType.GetConstructor(Type.EmptyTypes);
                var attributeClassObj = cstrPtr.Invoke(new object[] { });
                var method = attributeType.GetMethod(methodName);

                if (method == null) return false;

                return (bool)method.Invoke(attributeClassObj, values);
            }

            return true;
        }
    }
}
