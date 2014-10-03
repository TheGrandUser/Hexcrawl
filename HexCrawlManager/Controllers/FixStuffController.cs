using HexCrawlManager.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Diagnostics;

namespace HexCrawlManager.Controllers
{
   [Authorize(Roles = "Admin")]
   public class FixStuffController : ApiController
   {
      private ApplicationDbContext db = new ApplicationDbContext();

      [HttpPost]
      public async Task<int> SyncMembershipsAndClaims([FromBody]string userName)
      {
         var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(this.db));

         var query = db.GameMemberships.Include(mem => mem.Game).Include(mem => mem.ApplicationUser);

         if (!string.IsNullOrEmpty(userName) && !userName.Equals("$all", StringComparison.InvariantCultureIgnoreCase))
         {
            query = query.Where(mem => mem.ApplicationUser.DisplayName == userName);
         }

         var memberships = await query.ToListAsync();
         int membershipsFixed = 0;
         foreach (var membershipGroup in memberships.GroupBy(m => m.ApplicationUser))
         {
            var user = membershipGroup.Key;
            var claims = await manager.GetClaimsAsync(user.Id);

            foreach (var membership in membershipGroup)
            {
               bool wasFixed = false;
               if (!claims.Where(c => c.Type == "GameMembership").Any(c => c.Value == membership.GameID.ToString()))
               {
                  var result = await manager.AddClaimAsync(user.Id, new Claim("GameMembership", membership.GameID.ToString()));
                  if (!result.Succeeded)
                  {
                     Trace.WriteLine(string.Format("Error creating GameMembership claim for user {0} for game {1}: errors {2}", user.Id, membership.GameID, 
                        string.Join(", ", result.Errors)));
                  }
                  else
                  {
                     wasFixed = true;
                  }
               }
               if (membership.Roles.Contains("Owner"))
               {
                  if (!claims.Where(c => c.Type == "GameOwnership").Any(c => c.Value == membership.GameID.ToString()))
                  {
                     var result = await manager.AddClaimAsync(user.Id, new Claim("GameOwnership", membership.GameID.ToString()));
                     if (!result.Succeeded)
                     {
                        Trace.WriteLine(string.Format("Error creating GameOwnership claim for user {0} for game {1}: errors {2}", user.Id, membership.GameID,
                           string.Join(", ", result.Errors)));
                     }
                     else
                     {
                        wasFixed = true;
                     }
                  }
               }
               if (membership.Roles.Contains("Gamemaster"))
               {
                  if (!claims.Where(c => c.Type == "GameMaster").Any(c => c.Value == membership.GameID.ToString()))
                  {
                     var result = await manager.AddClaimAsync(user.Id, new Claim("GameMaster", membership.GameID.ToString()));
                     if (!result.Succeeded)
                     {
                        Trace.WriteLine(string.Format("Error creating GameMaster claim for user {0} for game {1}: errors {2}", user.Id, membership.GameID,
                           string.Join(", ", result.Errors)));
                     }
                     else
                     {
                        wasFixed = true;
                     }
                  }
               }

               if (wasFixed)
               {
                  membershipsFixed++;
               }
            }
         }

         return membershipsFixed;
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
