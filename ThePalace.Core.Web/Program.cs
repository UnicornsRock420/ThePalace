using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using System;
using ThePalace.Core.Utility;

namespace ThePalace.Server.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var bindAddress = ConfigManager.GetValue("BindAddress", "0.0.0.0");

            if (string.IsNullOrWhiteSpace(bindAddress))
            {
                Environment.Exit(0);

                return;
            }

            WebHost.CreateDefaultBuilder(args)
                .UseUrls(bindAddress)
                .UseStartup<Startup>()
                .Build()
                .Run();
        }
    }
}
