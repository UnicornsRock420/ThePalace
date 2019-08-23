using Microsoft.AspNetCore.Mvc;

namespace ThePalace.Server.Web.Controllers
{
    public class ScriptWSController : Controller
    {
        [HttpGet]
        public ContentResult defaultscript()
        {
            return Content(string.Empty, "text/iptscrae");
        }
    }
}
