using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using HexCrawlManager.Models;
using System.IO;
using System.Net.Http.Formatting;
using System.Net.Http;
using Newtonsoft.Json.Linq;

namespace HexCrawlManager.Tests
{
   [TestClass]
   public class SerializationTests
   {
      string Serialize<T>(MediaTypeFormatter formatter, T value)
      {
         // Create a dummy HTTP Content.
         Stream stream = new MemoryStream();
         var content = new StreamContent(stream);
         /// Serialize the object.
         formatter.WriteToStreamAsync(typeof(T), value, stream, content, null).Wait();
         // Read the serialized string.
         stream.Position = 0;
         return content.ReadAsStringAsync().Result;
      }

      T Deserialize<T>(MediaTypeFormatter formatter, string str) where T : class
      {
         // Write the serialized string to a memory stream.
         Stream stream = new MemoryStream();
         StreamWriter writer = new StreamWriter(stream);
         writer.Write(str);
         writer.Flush();
         stream.Position = 0;
         // Deserialize to an object of type T
         return formatter.ReadFromStreamAsync(typeof(T), stream, null, null).Result as T;
      }

      HexagonDefinition defaultWhite;

      [TestInitialize]
      public void InitializeTests()
      {
         defaultWhite = new HexagonDefinition(1, new Color(1, 1, 1), "DefaultWhite");
         HexagonDefinition.Definitions.Add(defaultWhite.Name, defaultWhite);
      }

      [TestCleanup]
      public void TestCleanup()
      {
         HexagonDefinition.Definitions.Clear();
      }

      [TestMethod]
      public void HexTileSerialization()
      {
         HexTile tile = new HexTile(defaultWhite.Id, new AxialCoord(3, 4));

         var json = new JsonMediaTypeFormatter();
         
         var str = Serialize(json, tile);

         //JObject obj = JObject.Parse(str);

         //Assert.AreEqual(obj.Count, 2);
         HexTile tile2 = Deserialize<HexTile>(json, str);

         Assert.AreEqual(tile.Definition, tile2.Definition, "Definition");
         Assert.AreEqual(tile.Coord, tile2.Coord, "Coord");
      }
   }
}
