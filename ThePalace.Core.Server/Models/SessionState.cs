using System;
using System.Collections.Generic;
using ThePalace.Core.Types;
using ThePalace.Core.Utility;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Interfaces;

namespace ThePalace.Server.Models
{
    public class SessionState : IDisposable
    {
        public bool successfullyConnected;

        public UInt32 UserID
        {
            get => details.userID;
            set => details.userID = value;
        }

        public Int16 RoomID
        {
            get => details.roomID;
            set => details.roomID = value;
        }

        public string Name
        {
            get => details.name;
            set => details.name = value;
        }

        public Int16 userFlags;

        public UserRec details;
        public RegistrationRec reg;
        public Dictionary<string, object> extended;

        public INetworkDriver driver;

        public bool Authorized;
        public int AuthUserID;
        public List<int> AuthRoleIDs;
        public List<int> AuthMsgIDs;
        public List<string> AuthCmds;

        public SessionState()
        {
            successfullyConnected = false;

            extended = new Dictionary<string, object>();

            details = new UserRec
            {
                faceNbr = (Int16)RndGenerator.NextSecure(0, 16),
                colorNbr = (Int16)RndGenerator.NextSecure(0, 16),
                roomPos = new Point
                {
                    h = (Int16)RndGenerator.NextSecure(0, 512),
                    v = (Int16)RndGenerator.NextSecure(0, 384),
                }
            };

            UserID = 0;
            RoomID = 0;
        }

        public void Dispose()
        {
        }
    }
}
