using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using ThePalace.Core.Server.Models;

namespace ThePalace.Server.Core
{
    public static class PluginManager
    {
        private static volatile ConcurrentDictionary<Guid, Assembly> plugins = null;
        private static volatile PluginState pluginContext = null;

        public static void Init()
        {
            Load();
        }

        public static void Dispose()
        {
            if (plugins != null)
            {
                plugins.Clear();
                plugins = null;
            }

            if (pluginContext != null)
            {
                //pluginContext.Unload();
                pluginContext = null;
            }
        }

        public static void Load()
        {
            plugins = new ConcurrentDictionary<Guid, Assembly>();
            pluginContext = new PluginState();

            var path = Path.Combine(Environment.CurrentDirectory, "Plugins");

            Directory.CreateDirectory(path);

            var files = Directory.GetFiles(path, "*PLUGIN*.DLL", SearchOption.TopDirectoryOnly);

            foreach (var file in files)
            {
                lock (plugins)
                {
                    plugins.TryAdd(Guid.NewGuid(), pluginContext.LoadFromAssemblyPath(file));
                }
            }
        }

        public static Type GetType(string typeName)
        {
            foreach (var plugin in plugins.Values)
            {
                try
                {
                    return plugin.GetType(typeName);
                }
                catch { }
            }

            return null;
        }

        public static List<Type> GetTypes()
        {
            var result = new List<Type>();

            foreach (var plugin in plugins.Values)
            {
                try
                {
                    result.AddRange(plugin.GetTypes());
                }
                catch { }
            }

            return result;
        }

        //public static T GetInstance<T>(Type type) where T : class
        //{
        //    return (T)Activator.CreateInstance(type);
        //}

        //public static object InvokeMethod<T>(this T source, string methodName, params string[] args)
        //{
        //    var type = source.GetType();
        //    return type.InvokeMember(methodName, BindingFlags.Default | BindingFlags.InvokeMethod, null, source, args);
        //}
    }
}
