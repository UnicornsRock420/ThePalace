using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using ThePalace.Core.Utility;

namespace ThePalace.Core.Web
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            ConfigManager.SetCollection(Configuration = configuration);
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services
                .Configure<CookiePolicyOptions>(options =>
                {
                    // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                    options.CheckConsentNeeded = context => true;
                    options.MinimumSameSitePolicy = SameSiteMode.None;
                });
            services
                .AddMvc()
                //.AddWebSocketManager()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
#if (DEBUG)
            services
                .AddCors();
#endif
        }

        //public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        public void Configure(IApplicationBuilder app, IServiceProvider serviceProvider)
        {
            app
                .UseWebSockets()
                .UseStaticFiles()
                .UseCookiePolicy()
#if (DEBUG)
                .UseDeveloperExceptionPage()
                .UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().AllowCredentials());
#else
                .UseHttpsRedirection()
                .UseExceptionHandler("/Home/Error");
#endif

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                var relativeMediaUrl = ConfigManager.GetValue("RelativeMediaUrl", string.Empty);
                var baseUrl = string.Concat(relativeMediaUrl, !string.IsNullOrWhiteSpace(relativeMediaUrl) && relativeMediaUrl[relativeMediaUrl.Length - 1] == '/' ? string.Empty : "/");

                routes.MapRoute(
                    name: "PropsWS",
                    template: string.Concat(baseUrl, "webservice/props/{action=get}/{id?}"),
                    defaults: new { controller = "PropsWS" });

                routes.MapRoute(
                    name: "ScriptWS",
                    template: string.Concat(baseUrl, "{action=defaultscript}.php"),
                    defaults: new { controller = "ScriptWS" });
            });
        }
    }
}
