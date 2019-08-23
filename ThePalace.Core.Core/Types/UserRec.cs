using System;

namespace ThePalace.Core.Types
{
    public class UserRec
    {
        public UInt32 userID;
        public Point roomPos;
        public AssetSpec[] propSpec;
        public Int16 roomID;
        public Int16 faceNbr;
        public Int16 colorNbr;
        public Int16 awayFlag;
        public Int16 openToMsgs;
        public Int16 nbrProps;
        public string name;
    }
}
