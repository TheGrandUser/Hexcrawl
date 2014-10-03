using HexCrawlManager.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace HexCrawlManager.Controllers
{
   [Authorize]
   public class GamesController : Controller
   {
      private ApplicationDbContext db = new ApplicationDbContext();

      // GET: Games
      public async Task<ActionResult> Index()
      {
         var userId = this.User.Identity.GetUserId();

         var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(this.db));
         var claims = await manager.GetClaimsAsync(userId);
         var gameMembershipClaims = claims.Where(claim => claim.Type == "GameMembership").Select(claim => int.Parse(claim.Value));

         IQueryable<Game> gamesQuery = from claim in gameMembershipClaims.AsQueryable()
                                       join game in db.Games on claim equals game.ID
                                       select game;


         //IQueryable<Game> gamesQuery = from membership in db.GameMemberships
         //                              where membership.ApplicationUserID == userId
         //                              join game in db.Games on membership.GameID equals game.ID
         //                              select game;

         var games = await gamesQuery.ToListAsync();

         return View(games);
      }

      // GET: Games\AllGames
      public async Task<ActionResult> AllGames()
      {
         return View(await db.Games.ToListAsync());
      }

      // GET: Games/Details/5
      public async Task<ActionResult> Play(int? id)
      {
         if (id == null)
         {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
         }
         Game game = await db.Games.FindAsync(id);
         if (game == null)
         {
            return HttpNotFound();
         }

         return View(game);
      }

      // GET: Games/Create
      public ActionResult Create()
      {
         return View();
      }

      // POST: Games/Create
      // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
      // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
      [HttpPost]
      [ValidateAntiForgeryToken]
      public async Task<ActionResult> Create([Bind(Include = "ID,Name,Visibility")] Game game)
      {
         if (ModelState.IsValid)
         {
            var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(this.db));

            var appUser = await manager.FindByIdAsync(this.User.Identity.GetUserId());

            db.Games.Add(game);
            await db.SaveChangesAsync();

            await manager.AddClaimAsync(appUser.Id, new Claim("GameMembership", game.ID.ToString()));
            await manager.AddClaimAsync(appUser.Id, new Claim("GameOwnership", game.ID.ToString()));
            await manager.AddClaimAsync(appUser.Id, new Claim("GameMaster", game.ID.ToString()));

            var membership = new GameMembership()
            {
               Game = game,
               ApplicationUser = appUser,
               Roles = "Owner",
            };
            db.GameMemberships.Add(membership);
            await db.SaveChangesAsync();

            return RedirectToAction("Index");
         }

         return View(game);
      }

      // GET: Games/Edit/5
      public async Task<ActionResult> Edit(int? id)
      {
         if (id == null)
         {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
         }
         Game game = await db.Games.FindAsync(id);
         if (game == null)
         {
            return HttpNotFound();
         }
         return View(game);
      }

      // POST: Games/Edit/5
      // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
      // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
      [HttpPost]
      [ValidateAntiForgeryToken]
      public async Task<ActionResult> Edit([Bind(Include = "ID,Name,Visibility")] Game game)
      {
         if (ModelState.IsValid)
         {
            db.Entry(game).State = EntityState.Modified;
            await db.SaveChangesAsync();
            return RedirectToAction("Index");
         }
         return View(game);
      }

      // GET: Games/Delete/5
      public async Task<ActionResult> Delete(int? id)
      {
         if (id == null)
         {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
         }
         Game game = await db.Games.FindAsync(id);
         if (game == null)
         {
            return HttpNotFound();
         }
         return View(game);
      }

      // POST: Games/Delete/5
      [HttpPost, ActionName("Delete")]
      [ValidateAntiForgeryToken]
      public async Task<ActionResult> DeleteConfirmed(int id)
      {
         Game game = await db.Games.FindAsync(id);
         db.Games.Remove(game);
         await db.SaveChangesAsync();
         return RedirectToAction("Index");
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
