using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using ThePalace.Core.Database;

namespace ThePalace.Core.Utility
{
    public static class ConfigManager
    {
        private static volatile ConcurrentDictionary<string, object> _cache = new ConcurrentDictionary<string, object>();

        private static IConfiguration _collection = null;

        private static DateTime _UpdateDate;
        private static UInt32 _kvTTL;

        private static void CheckTTL()
        {
            if (_kvTTL == 0 || DateTime.UtcNow.Subtract(_UpdateDate).Minutes > _kvTTL)
            {
                try
                {
                    _kvTTL = ConfigManager.GetValue<UInt32>("AppCacheTTL", 3, true).Value;
                    _UpdateDate = DateTime.UtcNow;
                }
                catch
                {
                }
            }
        }

        public static void SetCollection(IConfiguration collection)
        {
            _collection = collection;
        }

        public static string GetConnectionString(this string key)
        {
            if (_collection != null)
            {
                return _collection.GetConnectionString(key);
            }
            else
            {
                return ConfigurationManager.ConnectionStrings[key].ConnectionString;
            }
        }

        public static string GetValue(this string key, string defaultValue = null, bool bypassCache = false)
        {
            if (!bypassCache)
            {
                CheckTTL();

                if (_cache.ContainsKey(key))
                {
                    return (string)_cache[key];
                }
            }

            var result = (string)null;
            var value = (string)null;

            var actions = new List<Action>
            {
                () =>
                {
                    if (_collection != null)
                    {
                        value = _collection.GetValue<string>(key);
                    }
                },
                () => {
                    value = ConfigurationManager.AppSettings[key];
                },
                () =>
                {
                    using (var dbContext = Database.Database.For<ThePalaceEntities>())
                    {
                        value = dbContext.Config.AsNoTracking()
                            .Where(c => c.Key == key)
                            .Select(c => c.Value)
                            .FirstOrDefault();
                    }
                },
            };

            foreach (var action in actions)
            {
                try
                {
                    action();

                    if (!string.IsNullOrWhiteSpace(value))
                    {
                        lock (_cache)
                        {
                            _cache[key] = result = value;
                        }

                        return result;
                    }
                }
                catch { }
            }

            return defaultValue;
        }

        public static T? GetValue<T>(this string key, T? defaultValue = null, bool bypassCache = false) where T : struct
        {
            if (!bypassCache)
            {
                CheckTTL();

                if (_cache.ContainsKey(key))
                {
                    return (T)_cache[key];
                }
            }

            T? result = null;
            var value = (string)null;

            var actions = new List<Action>
            {
                () =>
                {
                    value = _collection.GetValue<string>(key);
                },
                () => {
                    value = ConfigurationManager.AppSettings[key];
                },
                () =>
                {
                    using (var dbContext = Database.Database.For<ThePalaceEntities>())
                    {
                        value = dbContext.Config.AsNoTracking()
                            .Where(c => c.Key == key)
                            .Select(c => c.Value)
                            .FirstOrDefault();
                    }
                },
            };

            foreach (var action in actions)
            {
                try
                {
                    action();

                    if (!string.IsNullOrWhiteSpace(value))
                    {
                        lock (_cache)
                        {
                            _cache[key] = result = value.TryParse<T>();
                        }

                        return result;
                    }
                }
                catch { }
            }

            return defaultValue ?? default(T);
        }

        public static void SetValue(this string key, string value)
        {
            using (var dbContext = Database.Database.For<ThePalaceEntities>())
            {
                var cfg = dbContext.Config
                    .Where(c => c.Key == key)
                    .SingleOrDefault();

                if (cfg.Value != value)
                {
                    cfg.Value = value;
                }

                dbContext.SaveChanges();
            }
        }
    }
}
