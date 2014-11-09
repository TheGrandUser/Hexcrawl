using HexCrawlManager.Models;
using HexCrawlManager.Services;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace HexCrawlManager.Hubs
{
   [Authorize]
   [HubName("hexMapHub")]
   public class HexMapHub : Hub<IHexMapHubClient>
   {
      ApplicationDbContext db = new ApplicationDbContext();

      public async Task CreateHexMap(int gameId)
      {
         var game = await db.Games.FindAsync(gameId);

         if (game == null)
         {
            throw new ArgumentException("Game " + gameId + "does not exist");
         }

         if (!await IsUserAuthorizedToManageMapsForGame(gameId))
         {
            throw new NotAuthorizedException("Not authorized to create maps for game " + gameId);
         }

         var hexMap = new HexMap();
         hexMap.Game = game;
         db.HexMaps.Add(hexMap);

         await db.SaveChangesAsync();

         this.Clients.Group(this.GetGameGroupName(gameId)).HexMapCreated(gameId, hexMap.Id);
      }

      public async Task RemoveHexMap(int gameId, int mapId)
      {
         var game = await db.Games.FindAsync(gameId);

         if (game == null)
         {
            throw new ArgumentException("Game " + gameId + "does not exist");
         }

         if (!await IsUserAuthorizedToManageMapsForGame(gameId))
         {
            throw new NotAuthorizedException("Not authorized to remove maps for game " + gameId);
         }

         var hexMap = await this.db.HexMaps.FindAsync(mapId);

         this.db.HexMaps.Remove(hexMap);
         this.db.HexTiles.RemoveRange(hexMap.Tiles);

         await this.db.SaveChangesAsync();

         this.Clients.Group(this.GetGameGroupName(gameId)).HexMapRemoved(gameId, hexMap.Id);
      }

      public async Task SetTile(int mapId, AxialCoord coord, int tileDefinition)
      {
         var map = await db.HexMaps.Include(m => m.Game).FirstOrDefaultAsync(m => m.Id == mapId);

         if (map == null)
         {
            throw new ArgumentException("Could not access map");
         }

         var isAuthorized = await IsUserAuthorizedToEditMap(map.Id);

         if (!isAuthorized)
         {
            throw new ArgumentException("Could not access map");
         }

         var tile = await db.HexTiles.FindAsync(mapId, coord.Q, coord.R);
         if (tile == null)
         {
            throw new ArgumentException("no tile at coord " + coord);
         }
         tile.Definition = tileDefinition;

         await db.SaveChangesAsync();

         var game = map.Game;

         this.Clients.Group("Game" + game.ID).TileHasChanged(mapId, coord, tileDefinition);
      }

      public async Task JoinGameGroup(int gameId)
      {
         if (!await IsMemberOfGame(gameId))
         {
            throw new ArgumentException("Could not observe game " + gameId);
         }

         await this.Groups.Add(this.Context.ConnectionId, GetGameGroupName(gameId));
      }

      public async Task LeaveGameGroup(int gameId)
      {
         await this.Groups.Remove(this.Context.ConnectionId, GetGameGroupName(gameId));
      }




      async Task<bool> IsUserAuthorizedToEditMap(int mapId)
      {
         var map = await db.HexMaps.FindAsync(mapId);

         var game = map.Game;
         var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(this.db));

         var userId = this.Context.User.Identity.GetUserId();

         if (!game.Memberships.Any(m => m.ApplicationUserID == userId))
         {
            return false;
         }

         var claims = await manager.GetClaimsAsync(userId);

         var gameId = game.ID.ToString();

         if (!claims.Any(c => c.Type == "GameMaster" && c.Value == gameId))
         {
            return false;
         }

         return true;
      }

      async Task<bool> IsUserAuthorizedToManageMapsForGame(int gameId)
      {
         var userId = this.Context.User.Identity.GetUserId();

         var manager = new ApplicationUserManager(new UserStore<ApplicationUser>(this.db));

         var claims = await manager.GetClaimsAsync(userId);

         var gameIdStr = gameId.ToString();

         return claims.Where(c => c.Type == "GameOwnership" || c.Type == "GameMaster").Any(c => c.Value == gameIdStr);
      }

      async Task<bool> IsMemberOfGame(int gameId)
      {
         var userId = this.Context.User.Identity.GetUserId();

         return await this.db.GameMemberships.AnyAsync(membership => membership.GameID == gameId && membership.ApplicationUserID == userId);
      }

      string GetGameGroupName(int gameId)
      {
         return "Game" + gameId;
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

   public interface IHexMapHubClient
   {
      void TileHasChanged(int mapId, AxialCoord coord, int tileDefinition);
      void HexMapCreated(int gameId, int mapId);
      void HexMapRemoved(int gameId, int mapId);
   }
}