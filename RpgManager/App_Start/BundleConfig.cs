﻿using System.Web;
using System.Web.Optimization;

namespace RpgManager
{
   public class BundleConfig
   {
      // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
      public static void RegisterBundles(BundleCollection bundles)
      {

         bundles.Add(new ScriptBundle("~/bootstrap").Include(
                   "~/Assets/Bootstrap/js/bootstrap.js"));

         //Moved bootstrap css to own style tag in the _layout page.  This is to remove it from the optimizations which was breaking the fonts and icons.
         bundles.Add(new StyleBundle("~/styles").Include(
                   "~/Assets/Styles/styles.css"));


         bundles.Add(new ScriptBundle("~/ng").Include(
                     "~/Assets/ng/angular.min.js",
                     "~/Assets/ng/angular-route.min.js",
                     "~/Assets/ng/angular-cookies.min.js"));

         bundles.Add(new ScriptBundle("~/app").IncludeDirectory("~/Assets/app", "*.js", true));

         bundles.Add(new ScriptBundle("~/jquery").Include(
                     "~/Assets/jquery/jquery.min.js"));

         bundles.Add(new ScriptBundle("~/misc").Include(
             "~/Assets/misc/modernizr.min.js",
             "~/Assets/misc/respond.min.js"
             ));

         // Set EnableOptimizations to false for debugging. For more information,
         // visit http://go.microsoft.com/fwlink/?LinkId=301862
         BundleTable.EnableOptimizations = false;
      }
   }
}
