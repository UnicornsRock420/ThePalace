using Microsoft.AspNetCore.Mvc;

namespace ThePalace.Server.Web.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}
