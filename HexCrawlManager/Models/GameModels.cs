using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Data.Common;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;
using System.Xml.Serialization;
using Newtonsoft.Json;

namespace HexCrawlManager.Models
{
   public class Game
   {
      public int ID { get; set; }
      public string Name { get; set; }
      public GameVisibility Visibility { get; set; }

      [JsonIgnore]
      [XmlIgnore]
      public virtual ICollection<GameMembership> Memberships { get; set; }
      [JsonIgnore]
      [XmlIgnore]
      public virtual ICollection<HexMap> HexMaps { get; set; }
   }

   public class GameMembership
   {
      public int ID { get; set; }
      public int GameID { get; set; }
      public string ApplicationUserID { get; set; }

      public string Roles { get; set; }

      public virtual Game Game { get; set; }
      public virtual ApplicationUser ApplicationUser { get; set; }
   }

   public enum GameVisibility
   {
      Public,
      Private,
      Friends,
      Unlisted,
   }
}