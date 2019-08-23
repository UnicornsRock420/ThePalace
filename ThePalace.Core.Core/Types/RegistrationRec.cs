using System;

namespace ThePalace.Core.Types
{
    public class RegistrationRec
    {
        public UInt32 crc;
        public UInt32 counter;
        public string userName;
        public string wizPassword;
        public Int32 auxFlags;
        public UInt32 puidCtr;
        public UInt32 puidCRC;
        public UInt32 demoElapsed;
        public UInt32 totalElapsed;
        public UInt32 demoLimit;
        public Int16 desiredRoom;
        public string reserved;
        public UInt32 ulRequestedProtocolVersion;
        public UInt32 ulUploadCaps;
        public UInt32 ulDownloadCaps;
        public UInt32 ul2DEngineCaps;
        public UInt32 ul2DGraphicsCaps;
        public UInt32 ul3DEngineCaps;
    }
}
