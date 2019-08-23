using System;
using System.Collections.Generic;

namespace ThePalace.Core.Database
{
    public partial class UserData
    {
        public int UserId { get; set; }
        public short RoomPosV { get; set; }
        public short RoomPosH { get; set; }
        public short FaceNbr { get; set; }
        public short ColorNbr { get; set; }
        public short AwayFlag { get; set; }
        public short OpenToMsgs { get; set; }
    }
}
