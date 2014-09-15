﻿using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace RpgManager.Models
{
   public class User : IdentityUser
   {
      //Validation on the UserName field is done by the CustomUserValidator, the CustomerUserValidator must be initialized and is done so in the AccountController contructor.
      public string phone { get; set; }
      public string zip { get; set; }
      public string firstName { get; set; }
      public string lastname { get; set; }

      public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<User> manager, string authenticationType)
      {
         // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
         var userIdentity = await manager.CreateIdentityAsync(this, authenticationType);
         // Add custom user claims here
         return userIdentity;
      }

      public virtual List<todoItem> todoItems { get; set; }
   }

   public class todoItem
   {
      [Key]
      public int id { get; set; }
      public string task { get; set; }
      public bool completed { get; set; }
   }

   public class DBContext : IdentityDbContext<User>
   {
      public DBContext()
         : base("applicationDB")
      {

      }
      //Override default table names
      protected override void OnModelCreating(DbModelBuilder modelBuilder)
      {
         base.OnModelCreating(modelBuilder);

         //When the Model/Database are created, the default user and roles tables will be mapped to different names. EX: IdentityUser -> Users.
         modelBuilder.Entity<IdentityUser>().ToTable("Users");
         modelBuilder.Entity<User>().ToTable("Users");
         modelBuilder.Entity<IdentityRole>().ToTable("Roles");
         modelBuilder.Entity<IdentityUserRole>().ToTable("UserRoles");
      }

      public static DBContext Create()
      {
         return new DBContext();
      }

      public DbSet<todoItem> todos { get; set; }

   }

   //This function will ensure the database is created and seeded with any default data.
   public class DBInitializer : CreateDatabaseIfNotExists<DBContext>
   {
      protected override void Seed(DBContext context)
      {
         //The UserManager and RoleManager is great for creating default admin users and putting them into the necessary roles.
         //var UserManager = new UserManager<User>(new UserStore<User>(context));
         //var RoleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(context));

         //Create Role Test and User Test
         //List<string> roles = new List<string>() { "Active","Admin" };
         //foreach (string role in roles)
         //{
         //    if (!RoleManager.RoleExists(role))
         //    {
         //        var roleresult = RoleManager.Create(new IdentityRole(role));
         //    }
         //}

         //Create User=Admin with password=P@ssword123
         //User user = new User();
         //user.Email = "someemail@somedomain.com";
         //user.UserName = "someemail@somedomain.com";
         //var adminresult = UserManager.Create(user, "P@ssword123");

         ////Add User Admin to Role Admin
         //if (adminresult.Succeeded)
         //{
         //    var result = UserManager.AddToRole(user.Id, "Active");
         //    result = UserManager.AddToRole(user.Id, "Admin");
         //}
      }
   }
}

