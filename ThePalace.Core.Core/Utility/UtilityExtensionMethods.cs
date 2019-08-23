using ICSharpCode.SharpZipLib.GZip;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using ThePalace.Core.Enums;
using ThePalace.Core.Types;

namespace ThePalace.Core.Utility
{
    public static class UtilityExtensionMethods
    {
        [DllImport("libc")]
        public static extern int setsockopt(int sockfd, int level, int optname, byte[] optval, int optlen);

        public static T? TryParse<T>(this string source, T? defaultValue = null) where T : struct
        {
            byte index = (byte)Type.GetTypeCode(typeof(T));
            T result = default(T);

            try
            {
                var tryparse = new Dictionary<byte, Action> {
                    { (byte)TypeCode.String, () => { result = (T)(object)source; } },
                    { (byte)TypeCode.Boolean, () => { result = (T)(object)Boolean.Parse(source); } },
                    { (byte)TypeCode.DateTime, () => { result = (T)(object)DateTime.Parse(source); } },
                    { (byte)TypeCode.Char, () => { result = (T)(object)Char.Parse(source); } },
                    { (byte)TypeCode.Byte, () => { result = (T)(object)Byte.Parse(source); } },
                    { (byte)TypeCode.SByte, () => { result = (T)(object)SByte.Parse(source); } },
                    { (byte)TypeCode.Int16, () => { result = (T)(object)Int16.Parse(source); } },
                    { (byte)TypeCode.Int32, () => { result = (T)(object)Int32.Parse(source); } },
                    { (byte)TypeCode.Int64, () => { result = (T)(object)Int64.Parse(source); } },
                    { (byte)TypeCode.UInt16, () => { result = (T)(object)UInt16.Parse(source); } },
                    { (byte)TypeCode.UInt32, () => { result = (T)(object)UInt32.Parse(source); } },
                    { (byte)TypeCode.UInt64, () => { result = (T)(object)UInt64.Parse(source); } },
                    { (byte)TypeCode.Single, () => { result = (T)(object)Single.Parse(source); } },
                    { (byte)TypeCode.Double, () => { result = (T)(object)Double.Parse(source); } },
                    { (byte)TypeCode.Decimal, () => { result = (T)(object)Decimal.Parse(source); } },
                };

                tryparse[index]();

                return result;
            }
            catch { }

            try
            {
                var convert = new Dictionary<byte, Action> {
                    { (byte)TypeCode.String, () => { result = (T)(object)source; } },
                    { (byte)TypeCode.Boolean, () => { result = (T)(object)Convert.ToBoolean(source); } },
                    { (byte)TypeCode.DateTime, () => { result = (T)(object)Convert.ToDateTime(source); } },
                    { (byte)TypeCode.Char, () => { result = (T)(object)Convert.ToChar(source); } },
                    { (byte)TypeCode.Byte, () => { result = (T)(object)Convert.ToByte(source); } },
                    { (byte)TypeCode.SByte, () => { result = (T)(object)Convert.ToSByte(source); } },
                    { (byte)TypeCode.Int16, () => { result = (T)(object)Convert.ToInt16(source); } },
                    { (byte)TypeCode.Int32, () => { result = (T)(object)Convert.ToInt32(source); } },
                    { (byte)TypeCode.Int64, () => { result = (T)(object)Convert.ToInt64(source); } },
                    { (byte)TypeCode.UInt16, () => { result = (T)(object)Convert.ToUInt16(source); } },
                    { (byte)TypeCode.UInt32, () => { result = (T)(object)Convert.ToUInt32(source); } },
                    { (byte)TypeCode.UInt64, () => { result = (T)(object)Convert.ToUInt64(source); } },
                    { (byte)TypeCode.Single, () => { result = (T)(object)Convert.ToSingle(source); } },
                    { (byte)TypeCode.Double, () => { result = (T)(object)Convert.ToDouble(source); } },
                    { (byte)TypeCode.Decimal, () => { result = (T)(object)Convert.ToDecimal(source); } },
                };

                convert[index]();

                return result;
            }
            catch { }

            try
            {
                return (T)Convert.ChangeType(source, typeof(T));
            }
            catch { }

            return defaultValue ?? default(T);
        }

        public static string GetDescription(this Type type)
        {
            var description = (DescriptionAttribute)type.GetCustomAttributes(typeof(DescriptionAttribute), false)
                .FirstOrDefault();

            if (description == null)
            {
                return null;
            }

            return description.Description;
        }

        public static string GetDescription(this Enum value)
        {
            var description = (DescriptionAttribute)value.GetType().GetField(value.ToString()).GetCustomAttributes(typeof(DescriptionAttribute), false)
                .FirstOrDefault();

            if (description == null)
            {
                return null;
            }

            return description.Description;
        }

        public static byte[] GetBytes(this string source, int limit = 0, int offset = 0)
        {
            if (limit < 1)
            {
                limit = source.Length;
            }

            var result = new byte[source.Length];

            for (var j = offset; j < limit; j++)
            {
                result[j] = (byte)source[j];
            }

            return result;
        }

        public static string GetString(this byte[] source, int limit = 0, int offset = 0)
        {
            if (limit < 1 || limit > source.Length)
            {
                limit = source.Length;
            }

            var sb = new StringBuilder();

            for (var j = offset; j < limit; j++)
            {
                sb.Append((char)source[j]);
            }

            return sb.ToString();
        }

        public static byte[] WriteInt16(this Int16 source)
        {
            return BitConverter.GetBytes(source);
        }

        public static byte[] WriteInt32(this Int32 source)
        {
            return BitConverter.GetBytes(source);
        }

        public static byte[] WriteInt16(this UInt16 source)
        {
            return BitConverter.GetBytes(source);
        }

        public static byte[] WriteInt32(this UInt32 source)
        {
            return BitConverter.GetBytes(source);
        }

        public static Int16 ReadSInt16(this List<byte> source, int offset = 0)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            if (offset + 1 > source.Count)
            {
                return 0;
            }

            return BitConverter.ToInt16(source.Skip(offset).Take(2).ToArray());
        }

        public static Int32 ReadSInt32(this List<byte> source, int offset = 0)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            if (offset + 3 > source.Count)
            {
                return 0;
            }

            return BitConverter.ToInt32(source.Skip(offset).Take(4).ToArray());
        }

        public static UInt16 ReadUInt16(this List<byte> source, int offset = 0)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            if (offset + 1 > source.Count)
            {
                return 0;
            }

            return BitConverter.ToUInt16(source.Skip(offset).Take(2).ToArray());
        }

        public static UInt32 ReadUInt32(this List<byte> source, int offset = 0)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            if (offset + 3 > source.Count)
            {
                return 0;
            }

            return BitConverter.ToUInt32(source.Skip(offset).Take(4).ToArray());
        }

        public static Int16 ReadSInt16(this byte[] source, int offset = 0)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            if (offset + 1 > source.Length)
            {
                return 0;
            }

            return BitConverter.ToInt16(source, offset);
        }

        public static Int32 ReadSInt32(this byte[] source, int offset = 0)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            if (offset + 3 > source.Length)
            {
                return 0;
            }

            return BitConverter.ToInt32(source, offset);
        }

        public static UInt16 ReadUInt16(this byte[] source, int offset = 0)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            if (offset + 1 > source.Length)
            {
                return 0;
            }

            return BitConverter.ToUInt16(source, offset);
        }

        public static UInt32 ReadUInt32(this byte[] source, int offset = 0)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            if (offset + 3 > source.Length)
            {
                return 0;
            }

            return BitConverter.ToUInt32(source, offset);
        }

        public static string ReadPString(this byte[] source, int max, int offset = 0, int size = 0)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            if (size < 1)
            {
                size = 1;
            }

            var length = (Int32)0;

            switch (size)
            {
                case 4:
                    length = ReadSInt32(source, offset);

                    break;
                case 2:
                    length = ReadSInt16(source, offset);

                    break;
                default:
                    length = source[offset];
                    size = 1;

                    break;
            }

            if (length > max)
            {
                length = max;
            }

            return source
                .ToList()
                .Skip(size + offset)
                .Take(length)
                .ToArray()
                .GetString();
        }

        public static string ReadCString(this byte[] source, int offset)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            var length = source
                .Skip(offset)
                .ToList()
                .IndexOf(0);

            return source
                .ToList()
                .Skip(offset)
                .Take(length - 1)
                .ToArray()
                .GetString();
        }

        public static byte[] WritePString(this string source, int max, int size, bool padding = true)
        {
            var data = new List<byte>();

            if (size < 1)
            {
                size = 1;
            }

            var length = (Int32)source.Length;

            if (length >= max - size)
            {
                length = max - size;
            }

            switch (size)
            {
                case 4:
                    data.AddRange(WriteInt32(length));

                    break;
                case 2:
                    data.AddRange(WriteInt16((Int16)length));

                    break;
                default:
                    data.Add((byte)length);
                    size = 1;

                    break;
            }

            data.AddRange(source.GetBytes());

            if (padding)
            {
                for (var j = size + length; j < max; j++)
                {
                    data.Add(0);
                }
            }

            return data.ToArray();
        }

        public static byte[] WriteCString(this string source)
        {
            var data = new List<byte>();

            data.AddRange(source.GetBytes());
            data.Add(0);

            return data.ToArray();
        }

        public static void AddRange(this List<byte> dest, byte[] source, int max = 0, int offset = 0)
        {
            if (offset < 1)
            {
                offset = 0;
            }

            var range = new List<byte>();

            if (max > 0)
            {
                range = source
                    .Skip(offset)
                    .Take(max)
                    .ToList();
            }
            else
            {
                range = source
                    .Skip(offset)
                    .ToList();
            }

            dest.AddRange(range);
        }

        public static UInt16 SwapInt16(this UInt16 source)
        {
            return (UInt16)(
                ((source & 0x00FF) << 8) |
                ((source & 0xFF00) >> 8));
        }

        public static UInt32 SwapInt32(this UInt32 source)
        {
            return (UInt32)(
                ((source & 0x000000FF) << 24) |
                ((source & 0x0000FF00) << 8) |
                ((source & 0x00FF0000) >> 8) |
                ((source & 0xFF000000) >> 24));
        }

        public static void Clear<T>(this DbSet<T> dbSet) where T : class
        {
            dbSet.RemoveRange(dbSet);
        }

        public static bool HasUnsavedChanges(this DbContext dbContext)
        {
            return dbContext.ChangeTracker.HasChanges() ||
                dbContext.ChangeTracker.Entries().Any(e =>
                    e.State == EntityState.Added ||
                    e.State == EntityState.Modified ||
                    e.State == EntityState.Deleted);
        }

        public static void DropConnection(this Socket handler)
        {
            var actions = new List<Action>
            {
                () => { handler.Disconnect(false); },
                () => { handler.Shutdown(SocketShutdown.Both); },
                () => { handler.Close(); },
                () => { handler.Dispose(); },
            };

            foreach (var action in actions)
            {
                try
                {
                    action();
                }
                catch { }
            }
        }

        public static void SetKeepAlive(this Socket handler, bool on = true)
        {
            var keepAliveInterval_InMilliseconds = ConfigManager.GetValue<int>("KeepAliveInterval_InMilliseconds", 15000).Value;
            var keepAliveTime_InMilliseconds = ConfigManager.GetValue<int>("KeepAliveTime_InMilliseconds", 15000).Value;
            var size = Marshal.SizeOf(new uint());

            if (Environment.OSVersion.Platform == PlatformID.Unix)
            {
                setsockopt((int)handler.Handle, /* SOL_SOCKET */ 0x01, /* SO_KEEPALIVE */ 0x09, BitConverter.GetBytes(on ? (int)1 : (int)0), size);
                setsockopt((int)handler.Handle, /* IPPROTO_TCP */ 0x06, /* TCP_KEEPIDLE */ 0x04, BitConverter.GetBytes(keepAliveInterval_InMilliseconds), size);
                setsockopt((int)handler.Handle, /* IPPROTO_TCP */ 0x06, /* TCP_KEEPINTVL */ 0x05, BitConverter.GetBytes(keepAliveInterval_InMilliseconds), size);
            }
            else
            {
                var inOptionValues = new byte[size * 3];

                BitConverter.GetBytes((uint)(on ? 1 : 0)).CopyTo(inOptionValues, 0);
                BitConverter.GetBytes((uint)keepAliveTime_InMilliseconds).CopyTo(inOptionValues, size);
                BitConverter.GetBytes((uint)keepAliveInterval_InMilliseconds).CopyTo(inOptionValues, size * 2);

                handler.IOControl(IOControlCode.KeepAliveValues, inOptionValues, null);
            }
        }

        public static string GetIPAddress(this Socket handler)
        {
            return ((IPEndPoint)handler.RemoteEndPoint).Address.ToString();
        }

        public static string InvokePHP(this byte[] data, PHPCommands command)
        {
            if (data == null)
            {
                return null;
            }

            var path = Path.Combine(Directory.GetCurrentDirectory(), "Libraries");

            if (Environment.OSVersion.Platform == PlatformID.Unix)
            {
                path = Path.Combine(path, "Linux");
            }
            else
            {
                path = Path.Combine(path, "Win");
            }

            // Currently only x64 supported!
            if (true || Environment.Is64BitOperatingSystem)
            {
                path = Path.Combine(path, "x64");
            }
            else
            {
                path = Path.Combine(path, "x86");
            }

            if (Environment.OSVersion.Platform == PlatformID.Unix)
            {
                path = Path.Combine(path, "php");
            }
            else
            {
                path = Path.Combine(path, "php.exe");
            }

            if (File.Exists(path))
            {
                var cmd = command.ToString().ToLower();
                var b64 = Convert.ToBase64String(data);
                var proc = new Process();

                proc.StartInfo.FileName = path;
                proc.EnableRaisingEvents = false;
                proc.StartInfo.CreateNoWindow = false;
                proc.StartInfo.RedirectStandardError = false;
                proc.StartInfo.RedirectStandardOutput = true;
                proc.StartInfo.Arguments = $"-r \"error_reporting(0);echo {cmd}(base64_decode('{b64}'))\";";

                proc.Start();

                using (var hOutput = proc.StandardOutput)
                {
                    proc.WaitForExit(5000);

                    if (proc.HasExited)
                    {
                        return hOutput.ReadToEnd();
                    }
                }
            }

            return string.Empty;
        }

        public static void Remove<K, V>(this ConcurrentDictionary<K, V> source, K key)
        {
            CollectionExtensions.Remove<K, V>(source, key, out V value);
        }

        public static bool PointInPolygon(this List<Point> polygon, Point p)
        {
            var inside = false;
            var i = 0;
            var j = 0;

            for (i = 0, j = polygon.Count - 1; i < polygon.Count; j = i++)
            {
                if ((polygon[i].v > p.v) != (polygon[j].v > p.v) && p.h < ((polygon[j].h - polygon[i].h) * (p.v - polygon[i].v) / (polygon[j].v - polygon[i].v) + polygon[i].h))
                {
                    inside = !inside;
                }
            }

            return inside;
        }
    }
}
