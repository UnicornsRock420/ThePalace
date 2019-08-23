using System;
using System.Collections.Generic;

namespace ThePalace.Core.Database
{
    public partial class DrawCmds2
    {
        public short RoomId { get; set; }
        public int DrawCmdId { get; set; }
        public short DrawCmdType { get; set; }
        public byte[] Data { get; set; }
    }
}
