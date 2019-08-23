using Newtonsoft.Json;
using System;
using ThePalace.Core.Enums;

namespace ThePalace.Core.Types
{
    public class DrawCmdRec
    {
        [JsonIgnore]
        public Int16 nextOfst;
        [JsonIgnore]
        public Int16 reserved;
        public Int16 drawCmd;
        public UInt16 cmdLength;
        [JsonIgnore]
        public Int16 dataOfst;
        public byte[] data;

        public DrawCmdTypes type
        {
            get
            {
                return (DrawCmdTypes)(drawCmd & 0x00FF);
            }
            set
            {
                drawCmd = (short)((drawCmd & 0xFF00) | ((short)value & 0x00FF));
            }
        }

        public bool layer
        {
            get
            {
                return (drawCmd & 0x8000) != 0;
            }
            set
            {
                drawCmd = (short)((drawCmd & 0x00FF) | (value ? 0x8000 : 0x0000));
            }
        }

        public static int SizeOf
        {
            get => 10;
        }
    }
}
