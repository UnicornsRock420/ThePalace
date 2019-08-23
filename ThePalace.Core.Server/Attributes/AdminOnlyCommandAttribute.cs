using System;
using System.Collections.Generic;
using System.Linq;
using ThePalace.Core.Enums;
using ThePalace.Core.Interfaces;
using ThePalace.Server.Network;
using ThePalace.Server.Protocols;

namespace ThePalace.Core.Server.Attributes
{
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false)]
    public sealed class AdminOnlyCommandAttribute : Attribute, ICommandAttribute
    {
        public bool OnBeforeCommandExecute(Dictionary<string, object> contextValues)
        {
            if (contextValues.Keys.Contains("UserID"))
            {
                var userID = (UInt32)contextValues["UserID"];

                if (userID == 0xFFFFFFFF)
                {
                    return true;
                }

                var sessionState = SessionManager.sessionStates[(UInt32)contextValues["UserID"]];

                if (sessionState.Authorized)
                {
                    return true;
                }

                sessionState.Send(new MSG_XTALK
                {
                    text = "Sorry, this is an Admin only command.",
                }, EventTypes.MSG_XTALK, 0);
            }

            return false;
        }
    }
}
