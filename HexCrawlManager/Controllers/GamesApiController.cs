using HexCrawlManager.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;

namespace HexCrawlManager.Controllers
{
   [Authorize]
   public class GamesApiController : ApiController
   {
      private ApplicationDbContext db = new ApplicationDbContext();

      // GET: GamesApi/GamesList
      [HttpGet]
      [Route("api/GamesApi/MemberGames")]
      public async Task<List<GameResult>> GamesList()
      {
         var userId = this.User.Identity.GetUserId();

         IQueryable<Game> gamesQuery = from membership in db.GameMemberships
                                       where membership.ApplicationUserID == userId
                                       join game in db.Games on membership.GameID equals game.ID
                                       select game;

         var games = await gamesQuery.ToListAsync();

         return games.Select(GameResult.CreateFrom).ToList();
      }

      [HttpGet]
      [Route("api/GamesApi/Game/{gameId}")]
      public async Task<GameResult> GameInfo(int gameId)
      {
         var userId = this.User.Identity.GetUserId();

         IQueryable<Game> gamesQuery = from membership in db.GameMemberships
                                       where membership.ApplicationUserID == userId
                                       join game in db.Games on membership.GameID equals game.ID
                                       where game.ID == gameId
                                       select game;

         var theGame = await gamesQuery.SingleOrDefaultAsync();

         if (theGame == null)
         {
            throw new ArgumentException("Could not access game of id " + gameId);
         }

         return GameResult.CreateFrom(theGame);
      }

      [HttpPost]
      [Route("api/GamesApi/Create")]
      public async Task<GameResult> Create([FromBody]GameResult result)
      {
         if (result == null)
         {
            throw new ArgumentNullException("game");
         }

         GameVisibility visibility;
         if (!Enum.TryParse(result.Visibility, out visibility))
         {
            throw new ArgumentException("game.Visibility is not valid");
         }

         var game = new Game()
         {
            Name = result.Name,
            Visibility = visibility,
         };

         var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(this.db));

         var appUser = await manager.FindByIdAsync(this.User.Identity.GetUserId());

         db.Games.Add(game);

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


         result.GameId = game.ID;

         return result;
      }

      [HttpPost]
      [Route("api/GamesApi/Update")]
      public async Task Update(GameResult result)
      {
         if (result == null)
         {
            throw new ArgumentNullException("game");
         }

         GameVisibility visibility;
         if (!Enum.TryParse(result.Visibility, out visibility))
         {
            throw new ArgumentException("game.Visibility is not valid");
         }

         var game = await db.Games.FindAsync(result.GameId);

         if (game == null)
         {
            throw new ArgumentException("Could not find game with id " + result.GameId);
         }

         var userID = this.User.Identity.GetUserId();

         var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(this.db));

         var appUser = await manager.FindByIdAsync(this.User.Identity.GetUserId());

         var gameId = game.ID.ToString();

         var ownership = appUser.Claims.FirstOrDefault(c => c.ClaimType == "GameOwnership" && c.ClaimValue == gameId);

         if (ownership == null)
         {
            throw new ArgumentException("Could not update game");
         }

         game.Name = result.Name;
         game.Visibility = visibility;

         await db.SaveChangesAsync();
      }

      [HttpPost]
      [Route("api/GamesApi/Delete/{gameId}")]
      public async Task Delete(int? gameID)
      {
         if (gameID == null)
         {
            throw new ArgumentNullException("gameID");
         }

         var id = gameID.Value;

         var game = await db.Games.FindAsync(id);

         if (game == null)
         {
            throw new ArgumentException("Could not find game with id " + id);
         }
         var userID = this.User.Identity.GetUserId();

         var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(this.db));

         var appUser = await manager.FindByIdAsync(this.User.Identity.GetUserId());

         if (!DoesUserOwnGame(appUser, id))
         {
            throw new ArgumentException("Could not delete game");
         }

         var memberships = await db.GameMemberships.Where(m => m.GameID == id).Include(m => m.ApplicationUser).ToListAsync();

         var claims = await Task.WhenAll(memberships.Select(m => m.ApplicationUser).Select(user =>
            manager.GetClaimsAsync(user.Id).ContinueWith(t => new { Claims = t.Result, User = user })));

         var strId = id.ToString();
         var removeTasks = from tuple in claims
                           from claim in tuple.Claims
                           where (claim.Type == "GameOwnership" || claim.Type == "GameOwnership" || claim.Type == "GameMaster") && claim.Value == strId
                           select manager.RemoveClaimAsync(tuple.User.Id, claim);
         await Task.WhenAll(removeTasks);


         db.GameMemberships.RemoveRange(memberships);
         db.Games.Remove(game);

         await db.SaveChangesAsync();
      }

      bool DoesUserOwnGame(ApplicationUser appUser, int gameID)
      {
         var gameId = gameID.ToString();
         var ownership = appUser.Claims.FirstOrDefault(c => c.ClaimType == "GameOwnership" && c.ClaimValue == gameId);

         return false;
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

   public class GameResult
   {
      public string Name { get; set; }
      public string Visibility { get; set; }
      public int GameId { get; set; }

      public static GameResult CreateFrom(Game game)
      {
         return new GameResult()
         {
            Name = game.Name,
            Visibility = game.Visibility.ToString(),
            GameId = game.ID
         };
      }
   }
}
