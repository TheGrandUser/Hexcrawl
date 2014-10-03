using HexCrawlManager.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace HexCrawlManager.Controllers
{
   public class HomeController : Controller
   {
      private ApplicationDbContext db = new ApplicationDbContext();

      public async Task<ActionResult> Index()
      {
         if (this.User.Identity.IsAuthenticated)
         {
            var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(this.db));

            var appUser = await manager.FindByIdAsync(this.User.Identity.GetUserId());

            IQueryable<Game> games = from membership in db.GameMemberships
                                     where membership.ApplicationUserID == appUser.Id
                                     join game in db.Games on membership.GameID equals game.ID
                                     select game;

            var adminRole = await db.Roles.FirstOrDefaultAsync(role => role.Name == "Admin");

            this.ViewBag.Games = await games.ToListAsync();

            this.ViewBag.Claims = await manager.GetClaimsAsync(appUser.Id);
            this.ViewBag.Roles = await manager.GetRolesAsync(appUser.Id);
         }

         return View();
      }

      public ActionResult About()
      {
         ViewBag.Message = "Your application description page.";

         return View();
      }

      public ActionResult Contact()
      {
         ViewBag.Message = "Your contact page.";

         return View();
      }

      protected override void Dispose(bool disposing)
      {
         if (disposing)
         {
            db.Dispose();
         }
         base.Dispose(disposing);
      }
   }
}