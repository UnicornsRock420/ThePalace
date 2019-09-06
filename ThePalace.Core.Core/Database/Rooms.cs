using System;
using System.Collections.Generic;

namespace ThePalace.Core.Database
{
    public partial class Rooms
    {
        public short RoomId { get; set; }
        public string Name { get; set; }
        public int Flags { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime? LastModified { get; set; }
        public short MaxOccupancy { get; set; }
        public short OrderID { get; set; }
    }
}
