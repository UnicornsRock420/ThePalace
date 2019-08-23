using System;
using System.Collections.Generic;

namespace ThePalace.Core.Database
{
    public partial class Crons
    {
        public int CronId { get; set; }
        public string Name { get; set; }
        public string SpName { get; set; }
    }
}
