using HexCrawlManager.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace HexCrawlManager.Controllers
{
   [Authorize]
   public class HexMapController : ApiController
   {
      // GET api/<controller>
      /// <summary>
      /// Returns a list of the maps that the current user owns
      /// </summary>
      /// <returns>Returns a collection of HexMapId objects, or an empty collection</returns>
      [HttpGet]
      public IEnumerable<HexMapId> GetOwnedHexMapNames()
      {
         return new HexMapId[] { new HexMapId() { Name = "Dragon Valley", Id = 1 }, new HexMapId() { Name = "Kingdom of Vernor", Id = 2 } };
      }

      // GET api/<controller>/5
      /// <summary>
      /// Gets the data for a particular map
      /// </summary>
      /// <param name="id">THe id of the map</param>
      /// <returns>Returns a HexTileMap</returns>
      [HttpGet]
      public HexTileMap GetMap(int id)
      {
         return null;
      }

      // POST api/<controller>
      /// <summary>
      /// Creates a nwe hex map
      /// </summary>
      /// <param name="name">The name of the map</param>
      /// <param name="width">The width of the map</param>
      /// <param name="height">The height of the map</param>
      [HttpPost]
      public void CreateNewHexMap(string name, int width, int height)
      {
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
   }
}