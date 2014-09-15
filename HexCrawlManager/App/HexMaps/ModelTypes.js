var HexMaps;
(function (HexMaps) {
    'use strict';

    HexMaps.SQRT3 = Math.sqrt(3);
    HexMaps.SQRT3_3 = Math.sqrt(3) / 3;

    (function (Orientation) {
        Orientation[Orientation["FlatTopped"] = 0] = "FlatTopped";
        Orientation[Orientation["PointyTopped"] = 1] = "PointyTopped";
    })(HexMaps.Orientation || (HexMaps.Orientation = {}));
    var Orientation = HexMaps.Orientation;

    (function (MapShape) {
        MapShape[MapShape["Rectangular"] = 0] = "Rectangular";
        MapShape[MapShape["Triangle"] = 1] = "Triangle";
        MapShape[MapShape["Hex"] = 2] = "Hex";
        MapShape[MapShape["Rhombus"] = 3] = "Rhombus";
    })(HexMaps.MapShape || (HexMaps.MapShape = {}));
    var MapShape = HexMaps.MapShape;

    (function (Direction) {
        Direction[Direction["UpXDownY"] = 0] = "UpXDownY";
        Direction[Direction["UpXDownZ"] = 1] = "UpXDownZ";
        Direction[Direction["UpYDownZ"] = 2] = "UpYDownZ";
        Direction[Direction["UpYDownX"] = 3] = "UpYDownX";
        Direction[Direction["UpZDownX"] = 4] = "UpZDownX";
        Direction[Direction["UpZDownY"] = 5] = "UpZDownY";
    })(HexMaps.Direction || (HexMaps.Direction = {}));
    var Direction = HexMaps.Direction;

    /**
    * A point is simply x and y coordinates
    */
    var Point = (function () {
        function Point(X, Y) {
            this.X = X;
            this.Y = Y;
        }
        Point.prototype.add = function (p) {
            return new Point(this.X + p.X, this.Y + p.Y);
        };

        Point.prototype.addX = function (x) {
            return new Point(this.X + x, this.Y);
        };

        Point.prototype.addY = function (y) {
            return new Point(this.X, this.Y + y);
        };

        Point.prototype.sub = function (p) {
            return new Point(this.X - p.X, this.Y - p.Y);
        };
        return Point;
    })();
    HexMaps.Point = Point;

    var Rectangle = (function () {
        function Rectangle(X, Y, width, height) {
            this.X = X;
            this.Y = Y;
            this.width = width;
            this.height = height;
        }
        return Rectangle;
    })();
    HexMaps.Rectangle = Rectangle;

    var Line = (function () {
        function Line(X1, Y1, X2, Y2) {
            this.X1 = X1;
            this.Y1 = Y1;
            this.X2 = X2;
            this.Y2 = Y2;
        }
        return Line;
    })();
    HexMaps.Line = Line;

    var CubeCoord = (function () {
        function CubeCoord(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            if (x - Math.floor(x) > 0) {
                console.log("cube coord x is non-integer: " + x);
                throw "cube coord x is non-integer: " + x;
            }
            if (y - Math.floor(y) > 0) {
                console.log("cube coord y is non-integer: " + y);
                throw "cube coord y is non-integer: " + y;
            }
            if (z - Math.floor(z) > 0) {
                console.log("cube coord z is non-integer: " + z);
                throw "cube coord z is non-integer: " + z;
            }
            if (x + y + z !== 0) {
                console.log("cube coords are invalid! " + x + ", " + y + ", " + z);
                throw "cube coords are invalid! " + x + ", " + y + ", " + z;
            }
        }
        CubeCoord.prototype.toAxialCoord = function () {
            return new AxialCoord(this.x, this.z);
        };

        CubeCoord.prototype.getNeighbor = function (direction) {
            var d = CubeCoord.neighbors[direction];

            return new CubeCoord(this.x + d[0], this.y + d[1], this.z + d[2]);
        };

        CubeCoord.prototype.toPixel = function (orientation) {
            if (typeof orientation === "undefined") { orientation = 0 /* FlatTopped */; }
            var size = HexagonDefinition.SideLength;
            if (orientation === 0 /* FlatTopped */) {
                var x = size * 3 / 2 * this.x;
                var y = size * HexMaps.SQRT3 * (this.z + this.x / 2);
                return new Point(x, y);
            } else {
                var x = size * HexMaps.SQRT3 * (this.x + this.z / 2);
                var y = size * 3 / 2 * this.z;
                return new Point(x, y);
            }
        };

        CubeCoord.fromPoint = function (point, orientation) {
            if (typeof orientation === "undefined") { orientation = 0 /* FlatTopped */; }
            return getCoordAtPoint(point, orientation);
        };
        CubeCoord.neighbors = [
            [+1, -1, 0], [+1, 0, -1], [0, +1, -1],
            [-1, +1, 0], [-1, 0, +1], [0, -1, +1]
        ];
        return CubeCoord;
    })();
    HexMaps.CubeCoord = CubeCoord;

    var AxialCoord = (function () {
        function AxialCoord(q, r) {
            this.q = q;
            this.r = r;
        }
        AxialCoord.prototype.isSame = function (other) {
            return this.q === other.q && this.r === other.r;
        };

        AxialCoord.prototype.toCubeCoord = function () {
            return new CubeCoord(this.q, -this.q - this.r, this.r);
        };

        AxialCoord.prototype.getNeighbor = function (direction) {
            var d = AxialCoord.neighbors[direction];

            return new AxialCoord(this.q + d[0], this.r + d[1]);
        };

        AxialCoord.prototype.toPixel = function (orientation) {
            if (typeof orientation === "undefined") { orientation = 0 /* FlatTopped */; }
            var size = HexagonDefinition.SideLength;
            if (orientation === 0 /* FlatTopped */) {
                var x = size * 3 / 2 * this.q;
                var y = size * HexMaps.SQRT3 * (this.r + this.q / 2);
                return new Point(x, y);
            } else {
                var x = size * HexMaps.SQRT3 * (this.r + this.q / 2);
                var y = size * 3 / 2 * this.r;
                return new Point(x, y);
            }
        };

        AxialCoord.fromPoint = function (point, orientation) {
            if (typeof orientation === "undefined") { orientation = 0 /* FlatTopped */; }
            return getCoordAtPoint(point, orientation).toAxialCoord();
        };
        AxialCoord.neighbors = [
            [+1, 0], [+1, -1], [0, -1],
            [-1, 0], [-1, +1], [0, +1]
        ];
        return AxialCoord;
    })();
    HexMaps.AxialCoord = AxialCoord;

    var HexRectangle = (function () {
        function HexRectangle(rect, orientation) {
            if (typeof orientation === "undefined") { orientation = 0 /* FlatTopped */; }
            this.worldRect = rect;
            this.orientation = orientation;

            this.upperLeft = AxialCoord.fromPoint(new Point(rect.X, rect.Y), orientation);
            this.upperRight = AxialCoord.fromPoint(new Point(rect.X + rect.width, rect.Y), orientation);
            this.lowerLeft = AxialCoord.fromPoint(new Point(rect.X, rect.Y + rect.height), orientation);
            this.lowerRight = AxialCoord.fromPoint(new Point(rect.X + rect.width, rect.Y + rect.height), orientation);

            var upperLeftOffset = new Point(rect.X, rect.Y).sub(this.upperLeft.toPixel(orientation));
            var upperRightCenter = new Point(rect.X + rect.width, rect.Y).sub(this.upperRight.toPixel(orientation));
            var lowerLeftCenter = new Point(rect.X, rect.Y + rect.height).sub(this.lowerLeft.toPixel(orientation));

            this.upperEdgeDownFirst = upperLeftOffset.Y > 0;
            this.leftEdgeOffsetLeftOne = upperLeftOffset.X < -HexagonDefinition.SideLength / 2;
            this.lowerEdgeDownFirst = lowerLeftCenter.Y > 0;
            this.rightEdgeOffsetRightOne = upperRightCenter.X > HexagonDefinition.SideLength / 2;

            console.log("upperEdgeDownFirst: " + this.upperEdgeDownFirst);
            console.log("leftEdgeOffsetLeftOne: " + this.leftEdgeOffsetLeftOne);
            console.log("bottomEdgeDownFirst: " + this.lowerEdgeDownFirst);
            console.log("rightEdgeOffsetRightOne: " + this.rightEdgeOffsetRightOne);
        }
        HexRectangle.prototype.isInBounds = function (coord) {
            // flat topped
            if (coord.q < this.upperLeft.q) {
                return this.leftEdgeOffsetLeftOne && coord.q === (this.upperLeft.q - 1) && coord.r > this.upperLeft.r && coord.r < this.lowerLeft.r + 1;
            }

            if (coord.q > this.upperRight.q) {
                return this.rightEdgeOffsetRightOne && coord.q === (this.upperLeft.q + 1) && coord.r > this.upperRight.r - 1 && coord.r < this.lowerRight.r;
            }

            var upperAdjust = this.upperEdgeDownFirst ? 1 : 0;
            var lowerAdjust = this.lowerEdgeDownFirst ? 1 : 0;

            var upperR = Math.floor(this.upperLeft.r - (coord.q - this.upperLeft.q - upperAdjust) / 2);
            var lowerR = Math.floor(this.lowerLeft.r - (coord.q - this.lowerLeft.q - lowerAdjust) / 2);

            if (coord.r < upperR || coord.r > lowerR) {
                return false;
            }

            return true;
            //return coord.isSame(this.upperLeft) ||
            //    coord.isSame(this.upperRight) ||
            //    coord.isSame(this.lowerLeft) ||
            //    coord.isSame(this.lowerRight);
        };

        HexRectangle.prototype.getCoords = function () {
            // flat topped
            var coords = [];

            if (this.leftEdgeOffsetLeftOne) {
                var current = this.upperLeft.getNeighbor(4);

                for (var r = current.r; r < this.lowerLeft.r + 1; r++) {
                    coords.push(new AxialCoord(current.q, r));
                }
            }

            var upperAdjust = this.upperEdgeDownFirst ? 1 : 0;
            var lowerAdjust = this.lowerEdgeDownFirst ? 1 : 0;

            for (var q = this.upperLeft.q; q < this.upperRight.q + 1; q++) {
                var upperR = Math.floor(this.upperLeft.r - (q - this.upperLeft.q - upperAdjust) / 2);
                var lowerR = Math.floor(this.lowerLeft.r - (q - this.lowerLeft.q - lowerAdjust) / 2);

                for (var r = upperR; r < lowerR + 1; r++) {
                    coords.push(new AxialCoord(q, r));
                }
            }

            if (this.rightEdgeOffsetRightOne) {
                var current = this.upperRight.getNeighbor(0);

                for (var r = current.r; r < this.lowerRight.r + 1; r++) {
                    coords.push(new AxialCoord(current.q, r));
                }
            }

            return coords;
        };
        return HexRectangle;
    })();
    HexMaps.HexRectangle = HexRectangle;

    function getCoordAtPoint(worldPoint, orientation) {
        //var point = new Point(worldPoint.X + HexWidth(orientation), worldPoint.Y + HexHeight(orientation));
        var point = worldPoint;

        var size = HexagonDefinition.SideLength;

        var aq;
        var ar;
        if (orientation === 0 /* FlatTopped */) {
            aq = 2 / 3 * point.X / size;
            ar = (-1 / 3 * point.X + HexMaps.SQRT3_3 * point.Y) / size;
        } else {
            aq = (HexMaps.SQRT3_3 * point.X - 1 / 3 * point.Y) / size;
            ar = 2 / 3 * point.Y / size;
        }

        return hexRound(aq, -aq - ar, ar);
    }

    function hexRound(x, y, z) {
        var rx = Math.round(x);
        var ry = Math.round(y);
        var rz = Math.round(z);

        var xDiff = Math.abs(rx - x);
        var yDiff = Math.abs(ry - y);
        var zDiff = Math.abs(rz - z);

        if (xDiff > yDiff && xDiff > zDiff) {
            rx = -ry - rz;
        } else if (yDiff > zDiff) {
            ry = -rx - rz;
        } else {
            rz = -rx - ry;
        }
        return new CubeCoord(rx, ry, rz);
    }
    HexMaps.hexRound = hexRound;

    var HexagonDefinition = (function () {
        function HexagonDefinition(color) {
            this.color = color;
            this.Id = null;
        }
        Object.defineProperty(HexagonDefinition, "alternatingDifference", {
            get: function () {
                return 3 / 4 * HexagonDefinition.VertexToVertex;
            },
            enumerable: true,
            configurable: true
        });

        HexagonDefinition.SetupHexStatics = function (edgeToEdge) {
            var angle = Math.PI / 6;

            var y = edgeToEdge / 2;
            var x = Math.tan(angle) * y;

            var z = Math.sqrt(x * x + y * y);

            var vertexToVertex = 2 * x + z;

            var contentDiv = document.getElementById("hexStatus");

            HexagonDefinition.VertexToVertex = vertexToVertex;
            HexagonDefinition.EdgeToEdge = edgeToEdge;
            HexagonDefinition.SideLength = z;

            HexagonDefinition.FlatTopPoints = [
                new HexMaps.Point(-vertexToVertex / 2, 0),
                new HexMaps.Point(-z / 2, -y),
                new HexMaps.Point(z / 2, -y),
                new HexMaps.Point(vertexToVertex / 2, 0),
                new HexMaps.Point(z / 2, y),
                new HexMaps.Point(-z / 2, y)
            ];

            HexagonDefinition.PointyTopPoints = [
                new Point(y, 0),
                new Point(edgeToEdge, x),
                new Point(edgeToEdge, x + z),
                new Point(y, vertexToVertex),
                new Point(0, x + z),
                new Point(0, x)
            ];

            contentDiv.innerHTML = "Values for Hex: <br /><b>Vertex to Vertex:</b> " + vertexToVertex + "<br /><b>Edge to Edge: </b>" + edgeToEdge + "<br /><b>Side Length, z:</b> " + z + "<br /><b>x:</b> " + x + "<br /><b>y:</b> " + y;
        };
        HexagonDefinition.VertexToVertex = 91.14378277661477;
        HexagonDefinition.EdgeToEdge = 91.14378277661477;
        HexagonDefinition.SideLength = 50.0;
        return HexagonDefinition;
    })();
    HexMaps.HexagonDefinition = HexagonDefinition;

    function getHexWidth(ori) {
        if (typeof ori === "undefined") { ori = 0 /* FlatTopped */; }
        if (ori === 0 /* FlatTopped */) {
            return HexagonDefinition.VertexToVertex;
        } else {
            return HexagonDefinition.EdgeToEdge;
        }
    }
    HexMaps.getHexWidth = getHexWidth;

    function getHexHeight(ori) {
        if (typeof ori === "undefined") { ori = 0 /* FlatTopped */; }
        if (ori === 0 /* FlatTopped */) {
            return HexagonDefinition.EdgeToEdge;
        } else {
            return HexagonDefinition.VertexToVertex;
        }
    }
    HexMaps.getHexHeight = getHexHeight;

    var HexTile = (function () {
        function HexTile(def, coord) {
            this.c = null;
            this.midPoint = null;
            this.definition = def;
            this.coord = coord;

            if (this.coord) {
                this.midPoint = this.coord.toPixel();
            }
        }
        Object.defineProperty(HexTile.prototype, "coord", {
            get: function () {
                return this.c;
            },
            set: function (value) {
                this.c = value;
                if (this.c) {
                    this.midPoint = this.c.toPixel();
                } else {
                    this.midPoint = null;
                }
            },
            enumerable: true,
            configurable: true
        });

        HexTile.prototype.draw = function (ctx, offset, highlight) {
            if (typeof highlight === "undefined") { highlight = false; }
            var point = this.midPoint.sub(offset);
            var hexPoints = HexagonDefinition.FlatTopPoints;

            if (highlight) {
                ctx.strokeStyle = "darkred";
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = "grey";
                ctx.lineWidth = 1;
            }

            ctx.fillStyle = this.definition.color;

            ctx.beginPath();
            ctx.moveTo(hexPoints[0].X + point.X, hexPoints[0].Y + point.Y);

            for (var i = 1; i < hexPoints.length; i++) {
                var p = hexPoints[i];
                ctx.lineTo(p.X + point.X, p.Y + point.Y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "black";
            ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            ctx.fillText("q" + this.coord.q + ", r" + this.coord.r, point.X, point.Y);
        };

        HexTile.prototype.drawSelection = function (ctx, offset) {
            var point = this.midPoint.sub(offset);
            var hexPoints = HexagonDefinition.FlatTopPoints;

            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(hexPoints[0].X + point.X, hexPoints[0].Y + point.Y);

            for (var i = 1; i < hexPoints.length; i++) {
                var p = hexPoints[i];
                ctx.lineTo(p.X + point.X, p.Y + point.Y);
            }
            ctx.closePath();
            ctx.stroke();
        };
        return HexTile;
    })();
    HexMaps.HexTile = HexTile;

    var HexTileStrip = (function () {
        function HexTileStrip(offset, tiles) {
            this.offset = offset;
            this.tiles = tiles;
        }
        return HexTileStrip;
    })();
    HexMaps.HexTileStrip = HexTileStrip;

    var HexTileMap = (function () {
        function HexTileMap(width, height, fillHex) {
            this.width = width;
            this.height = height;
            this.shape = 0 /* Rectangular */;

            // Flat Topped
            this.minQ = 0;
            this.maxQ = width;

            this.minR = -Math.floor(this.width / 2);
            this.maxR = height;

            this.hexes = new Array(height);

            for (var colIndex = 0; colIndex < this.width; colIndex++) {
                var firstRow;
                var numberOfTiles;

                firstRow = -Math.floor(colIndex / 2);
                numberOfTiles = this.height;

                var col = new HexTileStrip(firstRow, new Array(numberOfTiles));

                var q = colIndex;

                for (var j = 0; j < numberOfTiles; j++) {
                    var r = j + firstRow;
                    col.tiles[j] = new HexTile(fillHex, new AxialCoord(q, r));
                }

                this.hexes[colIndex] = col;
            }
            // Pointy Topped
            //this.minR = 0;
            //this.maxR = height;
            //this.minQ = -Math.floor(this.height / 2);
            //this.maxQ = width;
            //this.hexes = new Array(height);
            //for (var rowIndex = 0; rowIndex < this.height; rowIndex++) {
            //    var firstColumn: number;
            //    var numberOfTiles: number;
            //    firstColumn = -Math.floor(rowIndex / 2);
            //    numberOfTiles = this.width;
            //    var row = new HexTileStrip(firstColumn, new Array(numberOfTiles));
            //    var r = rowIndex;
            //    for (var j = 0; j < numberOfTiles; j++) {
            //        var q = j + firstColumn;
            //        row.tiles[j] = new HexTile(fillHex, new AxialCoord(q, r));
            //    }
            //    this.hexes[rowIndex] = row;
            //}
        }
        HexTileMap.prototype.hexAt = function (coord) {
            // flat Topped
            if (coord.q < this.minQ || coord.q >= this.maxQ) {
                return null;
            }

            var col = this.hexes[coord.q];

            var row = coord.r - col.offset;

            if (row < 0 || row >= col.tiles.length) {
                return null;
            }

            return col.tiles[row];
            // Pointy Topped
            //if (coord.r < this.minR || coord.r >= this.maxR) {
            //    return null;
            //}
            //var row = this.hexes[coord.r];
            //var column = coord.q - row.offset;
            //if (column < 0 || column > this.width) {
            //    return null;
            //}
            //return row.tiles[column];
        };

        HexTileMap.prototype.setHex = function (coord, hexDef) {
            // Flat Topped
            if (coord.q < this.minQ || coord.q >= this.maxQ) {
                return;
            }

            var col = this.hexes[coord.q];

            var row = coord.r - col.offset;

            if (row < 0 || row >= col.tiles.length) {
                return;
            }

            var hex = new HexTile(hexDef, coord);

            col.tiles[row] = hex;
            // Pointy Topped
            //if (coord.r < this.minR || coord.r >= this.maxR) {
            //    return;
            //}
            //var row = this.hexes[coord.r];
            //var column = coord.q - row.offset;
            //if (column < 0 || column > this.width) {
            //    return;
            //}
            //hex.Coord = coord;
            //row.tiles[column] = hex;
        };

        HexTileMap.prototype.draw = function (ctx, offset) {
        };

        HexTileMap.prototype.getLowerRightCoord = function () {
            var q = this.hexes.length - 1;
            var r = Math.floor(-q / 2) + this.height;
            return new AxialCoord(q, r);
        };
        return HexTileMap;
    })();
    HexMaps.HexTileMap = HexTileMap;
})(HexMaps || (HexMaps = {}));
//# sourceMappingURL=ModelTypes.js.map
