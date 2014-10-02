using System.Data.Entity;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Collections.Generic;
using System.Linq;

namespace HexCrawlManager.Models
{
   // You can add profile data for the user by adding more properties to your ApplicationUser class, please visit http://go.microsoft.com/fwlink/?LinkID=317594 to learn more.
   public class ApplicationUser : IdentityUser
   {
      public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
      {
         // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
         var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
         // Add custom user claims here
         return userIdentity;
      }

      public string DisplayName { get; set; }
      public virtual ICollection<GameMembership> Memberships { get; set; }
   }

   public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
   {
      public ApplicationDbContext()
         : base("DefaultConnection", throwIfV1Schema: false)
      {
      }

      public static ApplicationDbContext Create()
      {
         return new ApplicationDbContext();
      }

      public virtual DbSet<Game> Games { get; set; }
      public virtual DbSet<GameMembership> GameMemberships { get; set; }

      public virtual DbSet<HexMap> HexMaps { get; set; }
      public virtual DbSet<HexTile> HexTiles { get; set; }
   }
}