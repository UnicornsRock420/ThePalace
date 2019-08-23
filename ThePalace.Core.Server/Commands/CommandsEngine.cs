using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using ThePalace.Core.Database;
using ThePalace.Core.Interfaces;
using ThePalace.Core.Server.Attributes;
using ThePalace.Core.Utility;
using ThePalace.Server.Business;
using ThePalace.Server.Core;
using ThePalace.Server.Models;
using ThePalace.Server.Network;

namespace ThePalace.Server.Commands
{
    public static class CommandsEngine
    {
        public static bool Eval(ThePalaceEntities dbContext, UInt32 UserID, UInt32 TargetID, string input)
        {
            input = (input ?? string.Empty).Trim();

            if (input.Length > 0 && (UserID == 0xFFFFFFFF || input[0] == '`' || input[0] == '\''))
            {
                if (input[0] == '`' || input[0] == '\'')
                {
                    input = input.Remove(0, 1).Trim();
                }

                if (string.IsNullOrWhiteSpace(input))
                {
                    return true;
                }

                input = Regex.Replace(input, @"[^\w\d\s-]+", string.Empty);

                var args = Regex.Split(input, @"\s+").ToList();
                var cmd = args.FirstOrDefault().ToUpper();

                args = args.Skip(1).ToList();

                var type = PluginManager.GetType($"ThePalace.Server.Plugins.Commands.CMD_{cmd}");

                if (type == null)
                {
                    type = Type.GetType($"ThePalace.Server.Commands.CMD_{cmd}");
                }

                if (type != null)
                {
                    var attribute = type.GetCustomAttributes(typeof(AdminOnlyCommandAttribute), false).SingleOrDefault();

                    if (attribute != null)
                    {
                        var attributeType = attribute.GetType();
                        var cstrPtr = attributeType.GetConstructor(Type.EmptyTypes);
                        var attributeClassObj = cstrPtr.Invoke(new object[] { });
                        var method = attributeType.GetMethod("OnBeforeCommandExecute");
                        var value = (bool)method.Invoke(attributeClassObj, new object[] {
                            new Dictionary<string, object> {
                                { "UserID", UserID },
                            } });

                        if (!value)
                        {
                            return true;
                        }
                    }

                    var command = (ICommand)Activator.CreateInstance(type);

                    try
                    {
                        if (command != null && command.Command(dbContext, UserID, TargetID, args.ToArray()))
                        {
                            return true;
                        }
                    }
                    catch (Exception ex)
                    {
                        ex.DebugLog();
                    }
                }

                if (UserID == 0xFFFFFFFF)
                {
                    Logger.ConsoleLog("Invalid command... Command may not be adapted for console use or try help for a list of commands!");
                }
                else
                {
                    new MSG_XTALK().SendToUserID(dbContext, new Message
                    {
                        sessionState = SessionManager.sessionStates[UserID],
                        protocol = new Protocols.MSG_XTALK
                        {
                            text = "Invalid command... try again or try help for a list of commands!",
                        },
                    });
                }

                return true;
            }

            return false;
        }
    }
}
