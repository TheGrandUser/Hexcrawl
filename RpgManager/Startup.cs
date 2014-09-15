using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(RpgManager.Startup))]

namespace RpgManager
{
   public partial class Startup
   {
      public void Configuration(IAppBuilder app)
      {
         ConfigureAuth(app);
      }
   }
}
