using System;

namespace ThePalace.Core.Types
{
    public class RoomRec
    {
        public Int16 roomID;
        public Int32 roomFlags;
        public Int32 facesID;
        public string roomName;
        public string roomPicture;
        public string roomArtist;
        public string roomPassword;
        public Int16 roomMaxOccupancy;
        public DateTime? roomLastModified;
        public bool roomNotFound;
    }
}
