using HexCrawlManager.Models;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Authentication;
using System.Threading.Tasks;
using System.Web.Http;

namespace HexCrawlManager.Controllers
{
   [Authorize]
   public class HexMapController : ApiController
   {
      private ApplicationDbContext db = new ApplicationDbContext();

      // GET api/<controller>
      /// <summary>
      /// Returns a list of the maps that the current user owns
      /// </summary>
      /// <returns>Returns a collection of HexMapId objects, or an empty collection</returns>
      [HttpGet]
      public async Task<IEnumerable<HexMapInfo>> GetHexMapNamesForGame(int gameId)
      {
         var game = await db.Games.Include(g => g.Memberships).Include(g => g.HexMaps).SingleOrDefaultAsync(g => g.ID == gameId);

         if (game == null)
         {
            throw new ArgumentException("Game " + gameId + " not found");
         }

         if (!this.User.IsInRole("Administrator") && !game.Memberships.Any(m => m.ApplicationUserID == this.User.Identity.GetUserId()))
         {
            throw new AuthenticationException("Not a member of game " + gameId);
         }

         return game.HexMaps.Select(hexMap => new HexMapInfo() { Id = hexMap.Id, Name = hexMap.Name });
      }

      // GET api/<controller>/5
      /// <summary>
      /// Gets the data for a particular map
      /// </summary>
      /// <param name="hexMapId">THe id of the map</param>
      /// <returns>Returns a HexTileMap</returns>
      [HttpGet]
      public async Task<HexTileMap> GetMap(int hexMapId)
      {
         var hexMap = await this.db.HexMaps.Include(hm => hm.Game.Memberships).SingleOrDefaultAsync(hm => hm.Id == hexMapId);

         if (!this.User.IsInRole("Administrator") && !hexMap.Game.Memberships.Any(m => m.ApplicationUserID == this.User.Identity.GetUserId()))
         {
            throw new AuthenticationException("Not a member of game that owns hex map " + hexMapId);
         }

         var hexes = await this.db.HexTiles.Where(tile => tile.HexMapId == hexMapId).ToListAsync();

         var hexTileMap = new HexTileMap(hexMap.Width, hexMap.Height);

         hexTileMap.AddTiles(hexes);

         return hexTileMap;
      }

      // POST api/<controller>
      /// <summary>
      /// Creates a new hex map
      /// </summary>
      /// <param name="name">The name of the map</param>
      /// <param name="width">The width of the map</param>
      /// <param name="height">The height of the map</param>
      [HttpPost]
      public async Task<int> CreateNewHexMap(int gameId, string name, int width, int height)
      {
         // authenticate for game id
         // check that the user hasn't exceeded the allowed number of maps for subscription type
         // validate name/width/height

         var map = new HexMap()
         {
            Name = name,
            Width = width,
            Height = height
         };

         db.HexMaps.Add(map);
         
         await db.SaveChangesAsync();

         return map.Id;
      }

      //// PUT api/<controller>/5
      //public void Put(int id, [FromBody]string value)
      //{
      //}

      // DELETE api/<controller>/5
      /// <summary>
      /// Deletes a map
      /// </summary>
      /// <param name="id">The map's id</param>
      [HttpDelete]
      public void Delete(int id)
      {
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