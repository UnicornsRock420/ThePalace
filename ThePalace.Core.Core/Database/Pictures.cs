using System;
using System.Collections.Generic;

namespace ThePalace.Core.Database
{
    public partial class Pictures
    {
        public int UserId { get; set; }
        public short RoomId { get; set; }
        public short PictureId { get; set; }
        public string Name { get; set; }
        public short? TransColor { get; set; }
    }
}
