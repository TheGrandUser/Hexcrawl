using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace HexCrawlManager.Models
{
   public enum Orientation { FlatTopped, PointyTopped }
   public enum MapShape { Rectangular, Triangle, Hex, Rhombus }
   public enum Direction
   {
      UpXDownY,
      UpXDownZ,
      UpYDownZ,
      UpYDownX,
      UpZDownX,
      UpZDownY
   }

   public class Point
   {
      public double X;
      public double Y;

      public Point(double x, double y)
      {
         this.X = x;
         this.Y = y;
      }

      public Point Sub(Point point)
      {
         return new Point(this.X - point.X, this.Y - point.Y);
      }
   }

   public class Rectangle
   {
      public double X, Y, Width, Height;

      public Rectangle(double x, double y, double width, double height)
      {
         this.X = x;
         this.Y = y;
         this.Width = width;
         this.Height = height;
      }
   }

   public class Line
   {
      public double X1, Y1;
      public double X2, Y2;

      public Line(double x1, double y1, double x2, double y2)
      {
         this.X1 = x1;
         this.Y1 = y1;
         this.X2 = x2;
         this.Y2 = y2;
      }
   }

   public class CubeCoord
   {
      int x, y, z;

      public int X { get { return x; } }
      public int Y { get { return y; } }
      public int Z { get { return z; } }

      public CubeCoord(int x, int y, int z)
      {
         if (x + y + z != 0)
         {
            //console.log("cube coords are invalid! " + x + ", " + y + ", " + z);
            throw new ArgumentException("cube coords are invalid! " + x + ", " + y + ", " + z);
         }

         this.x = x;
         this.y = y;
         this.z = z;
      }

      public AxialCoord ToAxialCoord()
      {
         return new AxialCoord(this.x, this.z);
      }

      static int[][] neighbors =
      {
         new [] { +1, -1, 0 }, new [] { +1, 0, -1 }, new [] { 0, +1, -1 },
         new [] { -1, +1, 0 }, new [] { -1, 0, +1 }, new [] { 0, -1, +1 },
      };

      public CubeCoord GetNeighbor(Direction direction)
      {
         var d = neighbors[(int)direction];

         return new CubeCoord(this.x + d[0], this.y + d[1], this.z + d[2]);
      }

      public Point ToPixel(Orientation orientation = Orientation.FlatTopped)
      {
         var size = HexagonDefinition.SideLength;
         if (orientation == Orientation.FlatTopped)
         {
            var x = size * 3 / 2 * this.x;
            var y = size * HexMath.SQRT3 * (this.z + this.x / 2.0);
            return new Point(x, y);
         }
         else
         {
            var x = size * HexMath.SQRT3 * (this.x + this.z / 2.0);
            var y = size * 3 / 2 * this.z;
            return new Point(x, y);
         }
      }
   }

   public class AxialCoord : IEquatable<AxialCoord>
   {
      public int Q { get; set; }
      public int R { get; set; }

      static int[][] neighbors =
      {
         new [] { +1, 0 }, new [] { +1, -1 }, new [] { 0, -1 },
         new [] { -1, 0 }, new [] { -1, +1 }, new [] { 0, +1 },
      };

      public AxialCoord(int q, int r)
      {
         this.Q = q;
         this.R = r;
      }

      public AxialCoord GetNeighbor(Direction direction)
      {
         var d = AxialCoord.neighbors[(int)direction];

         return new AxialCoord(this.Q + d[0], this.R + d[1]);
      }

      public Point ToPixel(Orientation orientation = Orientation.FlatTopped)
      {
         var size = HexagonDefinition.SideLength;
         if (orientation == Orientation.FlatTopped)
         {
            var x = size * 3 / 2 * this.Q;
            var y = size * HexMath.SQRT3 * (this.R + this.Q / 2);
            return new Point(x, y);
         }
         else
         {
            var x = size * HexMath.SQRT3 * (this.R + this.Q / 2);
            var y = size * 3 / 2 * this.R;
            return new Point(x, y);
         }
      }

      public static AxialCoord FromPoint(Point point, Orientation orientation = Orientation.FlatTopped)
      {
         return HexMath.GetCoordAtPoint(point, orientation).ToAxialCoord();
      }

      public bool Equals(AxialCoord other)
      {
         return !object.ReferenceEquals(other, null) && this.Q == other.Q && this.R == other.R;
      }

      public override bool Equals(object obj)
      {
         if (obj is AxialCoord)
         {
            return this.Equals((AxialCoord)obj);
         }
         return base.Equals(obj);
      }

      public override int GetHashCode()
      {
         var qHash = this.Q.GetHashCode();
         var upper = qHash << 16;
         var lower = qHash >> 16;
         return R.GetHashCode() ^ (upper | lower);
      }
   }

   public class Color
   {
      public double Red { get; set; }
      public double Green { get; set; }
      public double Blue { get; set; }
      public double Alpha { get; set; }

      public Color(double red, double green, double blue, double alpha = 1.0)
      {
         this.Red = red;
         this.Green = green;
         this.Blue = blue;
         this.Alpha = alpha;
      }
   }

   public class HexRectangle
   {
      AxialCoord upperLeft;
      AxialCoord upperRight;
      AxialCoord lowerLeft;
      AxialCoord lowerRight;

      bool upperEdgeDownFirst;
      bool leftEdgeOffsetLeftOne;
      bool lowerEdgeDownFirst;
      bool rightEdgeOffsetRightOne;

      Rectangle rect;
      Orientation orientation;

      public HexRectangle(Rectangle rect, Orientation orientation = Orientation.FlatTopped)
      {
         this.rect = rect;
         this.orientation = orientation;

         this.upperLeft = AxialCoord.FromPoint(new Point(rect.X, rect.Y), orientation);
         this.upperRight = AxialCoord.FromPoint(new Point(rect.X + rect.Width, rect.Y), orientation);
         this.lowerLeft = AxialCoord.FromPoint(new Point(rect.X, rect.Y + rect.Height), orientation);
         this.lowerRight = AxialCoord.FromPoint(new Point(rect.X + rect.Width, rect.Y + rect.Height), orientation);

         var upperLeftOffset = new Point(rect.X, rect.Y).Sub(this.upperLeft.ToPixel(orientation));
         var upperRightCenter = new Point(rect.X + rect.Width, rect.Y).Sub(this.upperRight.ToPixel(orientation));
         var lowerLeftCenter = new Point(rect.X, rect.Y + rect.Height).Sub(this.lowerLeft.ToPixel(orientation));

         this.upperEdgeDownFirst = upperLeftOffset.Y > 0;
         this.leftEdgeOffsetLeftOne = upperLeftOffset.X < -HexagonDefinition.SideLength / 2;
         this.lowerEdgeDownFirst = lowerLeftCenter.Y > 0;
         this.rightEdgeOffsetRightOne = upperRightCenter.X > HexagonDefinition.SideLength / 2;
      }

      public bool IsInBounds(AxialCoord coord)
      {
         // flat topped
         if (coord.Q < this.upperLeft.Q)
         {
            return this.leftEdgeOffsetLeftOne &&
                coord.Q == (this.upperLeft.Q - 1) &&
                coord.R > this.upperLeft.R &&
                coord.R < this.lowerLeft.R + 1;
         }

         if (coord.Q > this.upperRight.Q)
         {

            return this.rightEdgeOffsetRightOne &&
                coord.Q == (this.upperLeft.Q + 1) &&
                coord.R > this.upperRight.R - 1 &&
                coord.R < this.lowerRight.R;
         }

         var upperAdjust = this.upperEdgeDownFirst ? 1 : 0;
         var lowerAdjust = this.lowerEdgeDownFirst ? 1 : 0;

         var upperR = this.upperLeft.R - (coord.Q - this.upperLeft.Q - upperAdjust) / 2;
         var lowerR = this.lowerLeft.R - (coord.Q - this.lowerLeft.Q - lowerAdjust) / 2;

         if (coord.R < upperR || coord.R > lowerR)
         {
            return false;
         }

         return true;
      }

      public IEnumerable<AxialCoord> AllCoords()
      {
         // flat topped

         if (this.leftEdgeOffsetLeftOne)
         {
            var current = this.upperLeft.GetNeighbor(Direction.UpZDownX);

            for (var r = current.R; r < this.lowerLeft.R + 1; r++)
            {
               yield return new AxialCoord(current.Q, r);
            }
         }

         int upperAdjust = this.upperEdgeDownFirst ? 1 : 0;
         int lowerAdjust = this.lowerEdgeDownFirst ? 1 : 0;

         for (int q = this.upperLeft.Q; q < this.upperRight.Q + 1; q++)
         {
            var upperR = this.upperLeft.R - (q - this.upperLeft.Q - upperAdjust) / 2;
            var lowerR = this.lowerLeft.R - (q - this.lowerLeft.Q - lowerAdjust) / 2;

            for (int r = upperR; r < lowerR + 1; r++)
            {
               yield return new AxialCoord(q, r);
            }
         }

         if (this.rightEdgeOffsetRightOne)
         {
            var current = this.upperRight.GetNeighbor(Direction.UpXDownY);

            for (var r = current.R; r < this.lowerRight.R + 1; r++)
            {
               yield return new AxialCoord(current.Q, r);
            }
         }
      }
   }

   [DataContract(IsReference = true)]
   [JsonObject(IsReference = true)]
   public class HexagonDefinition
   {
      public static double VertexToVertex = 91.14378277661477;
      public static double EdgeToEdge = 91.14378277661477;
      public static double SideLength = 50.0;
      public static double Flare = 5.0;
      public static Point[] FlatTopPoints;
      public static Point[] PointyTopPoints;
      
      static Dictionary<string, HexagonDefinition> definitions = new Dictionary<string,HexagonDefinition>();

      public static double AlternatingDifference { get { return 3 / 4 * VertexToVertex; } }
      public static void SetupHexStatics(double edgeToEdge)
      {
         var angle = Math.PI / 6;

         var y = edgeToEdge / 2;
         var x = Math.Tan(angle) * y;

         var z = Math.Sqrt(x * x + y * y);

         var vertexToVertex = 2 * x + z;

         HexagonDefinition.VertexToVertex = vertexToVertex;
         HexagonDefinition.EdgeToEdge = edgeToEdge;
         HexagonDefinition.SideLength = z;
         HexagonDefinition.Flare = x;

         HexagonDefinition.FlatTopPoints = new[]{
            new Point(-vertexToVertex / 2, 0), // middle left
            new Point(-z / 2, -y), // top left
            new Point(z / 2, -y), // top right
            new Point(vertexToVertex / 2, 0), // middle right
            new Point(z / 2, y), // bottom right
            new Point(-z / 2, y), // bottom left
         };

         HexagonDefinition.PointyTopPoints = new[]{
            new Point(y, 0), // top middle
            new Point(edgeToEdge, x), // top right
            new Point(edgeToEdge, x + z), // bottom right
            new Point(y, vertexToVertex), // bottom middle
            new Point(0, x + z), // bottom left
            new Point(0, x), // top left
         };
      }

      public static Dictionary<string, HexagonDefinition> Definitions { get { return definitions; } }

      [DataMember]
      public Color Color { get; set; }
      [DataMember]
      public string Name { get; set; }

      public HexagonDefinition(int id, Color color, string name)
      {
         this.Id = id;
         this.Color = color;
         this.Name = name;
      }

      public int Id { get; set; }
   }

   public static class HexMath
   {
      public static readonly double SQRT3 = Math.Sqrt(3);
      public static readonly double SQRT3_3 = Math.Sqrt(3) / 3;

      public static double GetHexWidth(Orientation ori = Orientation.FlatTopped)
      {
         if (ori == Orientation.FlatTopped)
         {
            return HexagonDefinition.VertexToVertex;
         }
         else
         {
            return HexagonDefinition.EdgeToEdge;
         }
      }

      public static double GetHexHeight(Orientation ori = Orientation.FlatTopped)
      {
         if (ori == Orientation.FlatTopped)
         {
            return HexagonDefinition.EdgeToEdge;
         }
         else
         {
            return HexagonDefinition.VertexToVertex;
         }
      }

      public static CubeCoord GetCoordAtPoint(Point worldPoint, Orientation orientation)
      {
         var point = worldPoint;

         var size = HexagonDefinition.SideLength;

         double aq;
         double ar;
         if (orientation == Orientation.FlatTopped)
         {
            aq = 2.0 / 3.0 * point.X / size;
            ar = (-1.0 / 3.0 * point.X + SQRT3_3 * point.Y) / size;
         }
         else
         {
            aq = (SQRT3_3 * point.X - 1.0 / 3.0 * point.Y) / size;
            ar = 2.0 / 3.0 * point.Y / size;
         }

         return HexRound(aq, -aq - ar, ar);
      }

      public static CubeCoord HexRound(double x, double y, double z)
      {
         var rx = (int)Math.Round(x);
         var ry = (int)Math.Round(y);
         var rz = (int)Math.Round(z);

         var xDiff = Math.Abs(rx - x);
         var yDiff = Math.Abs(ry - y);
         var zDiff = Math.Abs(rz - z);

         if (xDiff > yDiff && xDiff > zDiff)
         {
            rx = -ry - rz;
         }
         else if (yDiff > zDiff)
         {
            ry = -rx - rz;
         }
         else
         {
            rz = -rx - ry;
         }
         return new CubeCoord(rx, ry, rz);
      }
   }

   public class HexTile// : ISerializable
   {
      AxialCoord coord;
      Point midPoint;

      public HexTile(int definitionId, AxialCoord coord)
      {
         this.Definition = definitionId;
         this.Coord = coord;
      }

      public int Definition { get; set; }
      public AxialCoord Coord
      {
         get { return coord; }
         set
         {
            this.coord = value;
            this.midPoint = this.coord != null ? this.coord.ToPixel() : null;
         }
      }

      [JsonIgnore]
      public Point MidPoint { get { return this.midPoint; } }

      //public HexTile(SerializationInfo information, StreamingContext context)
      //{
      //   var coord = (AxialCoord)information.GetValue("Coord", typeof(AxialCoord));
      //   var defName = information.GetString("Definition");
      //   var definition = HexagonDefinition.Definitions[defName];

      //   this.Coord = coord;
      //   this.Definition = definition;
      //}

      //public void GetObjectData(SerializationInfo info, StreamingContext context)
      //{
      //   info.AddValue("Coord", this.coord);
      //   info.AddValue("Definition", this.Definition.Name);
      //}
   }

   public class HexTileStrip
   {
      HexTile[] tiles;

      public int Offset { get; private set; }
      public HexTile[] Tiles { get { return tiles; } }

      public HexTileStrip(int offset, int count)
      {
         this.Offset = offset;
         this.tiles = new HexTile[count];
      }
   }

   /// <summary>
   /// Has the map Id and Name
   /// </summary>
   public class HexMapId
   {
      /// <summary>
      /// The Id of the map
      /// </summary>
      public int Id { get; set; }
      /// <summary>
      /// The name of the map
      /// </summary>
      public string Name { get; set; }
   }

   public class HexTileMap
   {
      HexTileStrip[] hexes;
      //MapShape shape = MapShape.Rectangular;

      //int minR;
      //int maxR;

      //int minQ;
      //int maxQ;

      public int Width { get; private set; }
      public int Height { get; private set; }
      public HexTileStrip[] Hexes { get { return hexes; } }

      public HexTileMap(int width, int height, HexagonDefinition fillHex)
      {
         // Flat Topped

         this.Width = width;
         this.Height = height;

         //this.minQ = 0;
         //this.maxQ = width;

         //this.minR = -this.Width / 2;
         //this.maxR = height;

         this.hexes = new HexTileStrip[height];

         for (var colIndex = 0; colIndex < this.Width; colIndex++)
         {
            int firstRow;
            int numberOfTiles;

            firstRow = -colIndex / 2;
            numberOfTiles = this.Height;

            var col = new HexTileStrip(firstRow, numberOfTiles);

            var q = colIndex;

            for (var j = 0; j < numberOfTiles; j++)
            {
               var r = j + firstRow;
               col.Tiles[j] = new HexTile(fillHex.Id, new AxialCoord(q, r));
            }

            this.hexes[colIndex] = col;
         }
      }
   }



   public class HexTileMapTransfer
   {

   }
}