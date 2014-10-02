namespace HexCrawlManager.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class initialMigration : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.GameMemberships",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        GameID = c.Int(nullable: false),
                        ApplicationUserID = c.String(maxLength: 128),
                        Roles = c.String(),
                    })
                .PrimaryKey(t => t.ID)
                .ForeignKey("dbo.AspNetUsers", t => t.ApplicationUserID)
                .ForeignKey("dbo.Games", t => t.GameID, cascadeDelete: true)
                .Index(t => t.GameID)
                .Index(t => t.ApplicationUserID);
            
            CreateTable(
                "dbo.Games",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Visibility = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.ID);
            
            AddColumn("dbo.AspNetUsers", "DisplayName", c => c.String());
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.GameMemberships", "GameID", "dbo.Games");
            DropForeignKey("dbo.GameMemberships", "ApplicationUserID", "dbo.AspNetUsers");
            DropIndex("dbo.GameMemberships", new[] { "ApplicationUserID" });
            DropIndex("dbo.GameMemberships", new[] { "GameID" });
            DropColumn("dbo.AspNetUsers", "DisplayName");
            DropTable("dbo.Games");
            DropTable("dbo.GameMemberships");
        }
    }
}
