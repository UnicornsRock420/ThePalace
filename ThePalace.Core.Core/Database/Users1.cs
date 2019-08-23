using System;
using System.Collections.Generic;

namespace ThePalace.Core.Database
{
    public partial class Users1
    {
        public int UserId { get; set; }
        public short RoomId { get; set; }
        public string Name { get; set; }
        public short Flags { get; set; }
    }
}
