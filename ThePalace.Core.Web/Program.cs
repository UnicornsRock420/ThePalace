using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using ThePalace.Core.Utility;

namespace ThePalace.Core.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var bindAddress = ConfigManager.GetValue("BindAddress", string.Empty);

            if (string.IsNullOrEmpty(bindAddress))
            {
                bindAddress = $"http://192.168.1.215:5000";
            }

            WebHost.CreateDefaultBuilder(args)
                .UseUrls(bindAddress)
                .UseStartup<Startup>()
                .Build()
                .Run();
        }
    }
}
