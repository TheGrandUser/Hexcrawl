namespace HexCrawlManager.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class hexMapObjects : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.HexMaps",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Width = c.Int(nullable: false),
                        Height = c.Int(nullable: false),
                        GameId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Games", t => t.GameId, cascadeDelete: true)
                .Index(t => t.GameId);
            
            CreateTable(
                "dbo.HexTiles",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        HexMapId = c.Int(nullable: false),
                        Q = c.Int(nullable: false),
                        R = c.Int(nullable: false),
                        Definition = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.HexMaps", t => t.HexMapId, cascadeDelete: true)
                .Index(t => t.HexMapId)
                .Index(t => t.Q)
                .Index(t => t.R);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.HexTiles", "HexMapId", "dbo.HexMaps");
            DropForeignKey("dbo.HexMaps", "GameId", "dbo.Games");
            DropIndex("dbo.HexTiles", new[] { "R" });
            DropIndex("dbo.HexTiles", new[] { "Q" });
            DropIndex("dbo.HexTiles", new[] { "HexMapId" });
            DropIndex("dbo.HexMaps", new[] { "GameId" });
            DropTable("dbo.HexTiles");
            DropTable("dbo.HexMaps");
        }
    }
}
