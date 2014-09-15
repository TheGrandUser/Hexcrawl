using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(HexCrawlManager.Startup))]
namespace HexCrawlManager
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
