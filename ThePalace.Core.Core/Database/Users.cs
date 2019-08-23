using System;
using System.Collections.Generic;

namespace ThePalace.Core.Database
{
    public partial class Users
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public DateTime? LastLogin { get; set; }
    }
}
