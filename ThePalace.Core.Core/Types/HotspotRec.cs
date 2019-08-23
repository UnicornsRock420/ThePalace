using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using ThePalace.Core.Enums;

namespace ThePalace.Core.Types
{
    public class HotspotRec
    {
        [JsonIgnore]
        public Int32 scriptEventMask;
        public Int32 flags;
        [JsonIgnore]
        public Int32 secureInfo;
        [JsonIgnore]
        public Int32 refCon;
        public Point loc;
        public Int16 id;
        public Int16 dest;
        [JsonIgnore]
        public Int16 nbrPts;
        [JsonIgnore]
        public Int16 ptsOfst;
        public HotspotTypes type;
        [JsonIgnore]
        public Int16 groupID;
        [JsonIgnore]
        public Int16 nbrScripts;
        [JsonIgnore]
        public Int16 scriptRecOfst;
        public Int16 state;
        [JsonIgnore]
        public Int16 nbrStates;
        [JsonIgnore]
        public Int16 stateRecOfst;
        [JsonIgnore]
        public Int16 nameOfst;
        [JsonIgnore]
        public Int16 scriptTextOfst;
        [JsonIgnore]
        public Int16 alignReserved;

        public string name;
        public string script;

        public List<HotspotStateRec> states;
        public List<Point> Vortexes;

        public static int SizeOf
        {
            get => 48;
        }
    }
}
