using HexCrawlManager.Models;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HexCrawlManager.Services
{
   public interface IGameRepository : IDisposable
   {
      IEnumerable<Game> GetGamesByUser(ApplicationUser user);
      IEnumerable<Tuple<ApplicationUser, string>> GetUsersAndRoleByGame(Game game);
   }

   public class GameRepository : IGameRepository
   {
      ApplicationDbContext context;

      public GameRepository()
      {
         this.context = new ApplicationDbContext();
      }

      public IEnumerable<Game> GetGamesByUser(ApplicationUser user)
      {
         return from membership in user.Memberships
                select membership.Game;
      }

      public IEnumerable<Tuple<ApplicationUser, string>> GetUsersAndRoleByGame(Game game)
      {
         return from membership in game.Memberships
                select Tuple.Create(membership.ApplicationUser, membership.Roles);
      }

      public void Dispose()
      {
         this.context.Dispose();
      }
   }
}