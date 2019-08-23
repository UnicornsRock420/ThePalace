using System;
using System.Collections.Generic;

namespace ThePalace.Core.Database
{
    public partial class DrawCmds
    {
        public int UserId { get; set; }
        public short RoomId { get; set; }
        public int DrawCmdId { get; set; }
        public short DrawCmdType { get; set; }
    }
}
