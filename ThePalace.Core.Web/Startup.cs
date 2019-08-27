using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Web.Mvc;
using ThePalace.Core.Utility;

namespace ThePalace.Server.Web
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
                })
                //.AddAntiforgery(options =>
                //{
                //    // Set Cookie properties using CookieBuilder properties†.
                //    options.FormFieldName = "XSRF-FIELD";
                //    options.HeaderName = "X-XSRF-TOKEN";
                //    options.SuppressXFrameOptionsHeader = false;
                //})
                .AddCors()
                .AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
        }

        //public void Configure(IApplicationBuilder app, IAntiforgery antiforgery)
        //{
        //    app.Use(next => context =>
        //    {
        //        var path = context.Request.Path.Value;

        //        if (
        //            string.Equals(path, "/", StringComparison.OrdinalIgnoreCase) ||
        //            string.Equals(path, "/index.html", StringComparison.OrdinalIgnoreCase))
        //        {
        //            // The request token can be sent as a JavaScript-readable cookie, 
        //            // and Angular uses it by default.
        //            var tokens = antiforgery.GetAndStoreTokens(context);
        //            context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, new CookieOptions() { HttpOnly = false });
        //        }

        //        return next(context);
        //    });
        //}

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
                var relativeMediaUrl = ConfigManager.GetValue("RelativeMediaUrl", string.Empty);
                var baseUrl = string.Concat(relativeMediaUrl, !string.IsNullOrWhiteSpace(relativeMediaUrl) && relativeMediaUrl[relativeMediaUrl.Length - 1] == '/' ? string.Empty : "/");

                routes.MapRoute(
                    name: "PropsWS",
                    template: string.Concat(baseUrl, "webservice/props/{action}/{id}"),
                    defaults: new { controller = "PropsWS", action = "get", id = UrlParameter.Optional });

                routes.MapRoute(
                    name: "ScriptWS",
                    template: string.Concat(baseUrl, "{action}.php"),
                    defaults: new { controller = "ScriptWS", action = "defaultscript" });

                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action}/{id}",
                    defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional });
            });
        }
    }
}
