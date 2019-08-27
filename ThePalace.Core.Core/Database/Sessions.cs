using System;
using System.Collections.Generic;

namespace ThePalace.Core.Database
{
    public partial class Sessions
    {
        public int UserId { get; set; }
        public Guid Hash { get; set; }
        public DateTime LastUsed { get; set; }
        public DateTime UntilDate { get; set; }
    }
}
