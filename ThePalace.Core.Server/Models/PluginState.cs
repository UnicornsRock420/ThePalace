using System;
using System.Reflection;
using System.Runtime.Loader;

namespace ThePalace.Core.Server.Models
{
    public class PluginState : AssemblyLoadContext
    {
        public Assembly assembly;

        protected override Assembly Load(AssemblyName assemblyName)
        {
            return null;
        }
    }
}
