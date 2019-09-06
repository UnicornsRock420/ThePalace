using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using ThePalace.Core.Database;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Models;

namespace ThePalace.Server.Business
{
    [Description("nRom")]
    [AdminOnlyProtocol]
    [SuccessfullyConnectedProtocol]
    public struct MSG_ROOMNEW : IReceiveBusiness
    {
        public void Receive(ThePalaceEntities dbContext, object message)
        {
            var sessionState = ((Message)message).sessionState;
            var maxRoomId = dbContext.Rooms
                .Select(r => r.RoomId)
                .Max();
            var maxOrderId = dbContext.Rooms
                .Select(r => r.OrderID)
                .Max();

            maxRoomId++;
            maxOrderId++;

            var newRoom = new Rooms
            {
                RoomId = maxRoomId,
                Name = $"New Room {maxRoomId}",
                CreateDate = DateTime.UtcNow,
                OrderID = maxOrderId,
                MaxOccupancy = 0,
                Flags = 0,
            };
            dbContext.Rooms.Add(newRoom);

            var newRoomData = new RoomData
            {
                RoomId = maxRoomId,
                FacesId = 0,
                Password = null,
                PictureName = "clouds.png",
                ArtistName = sessionState.Name,
            };
            dbContext.RoomData.Add(newRoomData);

            dbContext.SaveChanges();

            Logger.Log(MessageTypes.Info, $"MSG_ROOMNEW[{sessionState.AuthUserID}]: {newRoom.Name}");

            var room = dbContext.GetRoom(maxRoomId);

            if (!room.NotFound)
            {
                sessionState.RoomID = room.ID;

                var sendBusinesses = new List<ISendBusiness>
                {
                    new MSG_ROOMDESC(),
                    new MSG_USERLIST(),
                    new MSG_ROOMDESCEND(),
                };

                foreach (var sendBusiness in sendBusinesses)
                {
                    sendBusiness.Send(dbContext, message);
                }

                new MSG_USERNEW().SendToRoomID(dbContext, message);
            }
        }
    }
}
