/**
* Translated to Typescript from https://github.com/mpalmerlee/HexagonTools/tree/master/js
*/
var OldHexMaps;
(function (OldHexMaps) {
    var Hexagon = (function () {
        function Hexagon(id, x, y) {
            this.x = x;
            this.y = y;
            this.PathCoOrdX = null;
            this.PathCoOrdY = null;
            this.Color = "white";
            this.Points = [];

            if (Hexagon.ORIENTATION == 0 /* FlatTopped */) {
                this.Points.push(new HexMaps.Point(Hexagon.x1 + x, y));
                this.Points.push(new HexMaps.Point(Hexagon.x1 + Hexagon.Side + x, y));
                this.Points.push(new HexMaps.Point(Hexagon.Width + x, Hexagon.y1 + y));
                this.Points.push(new HexMaps.Point(Hexagon.x1 + Hexagon.Side + x, Hexagon.Height + y));
                this.Points.push(new HexMaps.Point(Hexagon.x1 + x, Hexagon.Height + y));
                this.Points.push(new HexMaps.Point(x, Hexagon.y1 + y));
            } else {
                this.Points.push(new HexMaps.Point(Hexagon.x1 + x, y));
                this.Points.push(new HexMaps.Point(Hexagon.Width + x, Hexagon.y1 + y));
                this.Points.push(new HexMaps.Point(Hexagon.Width + x, Hexagon.y1 + Hexagon.Side + y));
                this.Points.push(new HexMaps.Point(Hexagon.x1 + x, Hexagon.Height + y));
                this.Points.push(new HexMaps.Point(x, Hexagon.y1 + Hexagon.Side + y));
                this.Points.push(new HexMaps.Point(x, Hexagon.y1 + y));
            }

            this.Id = id;

            this.selected = false;
        }
        Object.defineProperty(Hexagon, "VertexToVertex", {
            get: function () {
                if (Hexagon.ORIENTATION === 0 /* FlatTopped */) {
                    return Hexagon.Width;
                } else {
                    return Hexagon.Height;
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Hexagon, "EdgeToEdge", {
            get: function () {
                if (Hexagon.ORIENTATION === 0 /* FlatTopped */) {
                    return Hexagon.Height;
                } else {
                    return Hexagon.Width;
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Hexagon, "x1", {
            get: function () {
                if (Hexagon.ORIENTATION === 0 /* FlatTopped */) {
                    return (Hexagon.Width - Hexagon.Side) / 2;
                } else {
                    return (Hexagon.Width / 2);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hexagon, "y1", {
            get: function () {
                if (Hexagon.ORIENTATION === 0 /* FlatTopped */) {
                    return (Hexagon.Height / 2);
                } else {
                    return (Hexagon.Height - Hexagon.Side) / 2;
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Hexagon.prototype, "TopLeftPoint", {
            get: function () {
                return new HexMaps.Point(this.x, this.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hexagon.prototype, "BottomRightPoint", {
            get: function () {
                return new HexMaps.Point(this.x + Hexagon.Width, this.y + Hexagon.Height);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hexagon.prototype, "MidPoint", {
            get: function () {
                return new HexMaps.Point(this.x + (Hexagon.Width / 2), this.y + (Hexagon.Height / 2));
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Hexagon.prototype, "P1", {
            get: function () {
                return new HexMaps.Point(this.x + Hexagon.x1, this.y + Hexagon.y1);
            },
            enumerable: true,
            configurable: true
        });

        Hexagon.prototype.draw = function (ctx) {
            ctx.strokeStyle = "grey";
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(this.Points[0].X, this.Points[0].Y);
            for (var i = 1; i < this.Points.length; i++) {
                var p = this.Points[i];
                ctx.lineTo(p.X, p.Y);
            }
            ctx.closePath();
            ctx.stroke();

            if (this.Id) {
                //draw text for debugging
                ctx.fillStyle = "black";
                ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = 'middle';
                ctx.fillText(this.Id, this.MidPoint.X, this.MidPoint.Y);
            }

            if (this.PathCoOrdX !== null && this.PathCoOrdY !== null && typeof (this.PathCoOrdX) != "undefined" && typeof (this.PathCoOrdY)) {
                //draw co-ordinates for debugging
                ctx.fillStyle = "black";
                ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = 'middle';

                //var textWidth = ctx.measureText(this.Planet.BoundingHex.Id);
                ctx.fillText("(" + this.PathCoOrdX + "," + this.PathCoOrdY + ")", this.MidPoint.X, this.MidPoint.Y + 10);
            }

            if (Hexagon.DRAWSTATS) {
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;

                //draw our x1, y1, and z
                ctx.beginPath();
                ctx.moveTo(this.P1.X, this.y);
                ctx.lineTo(this.P1.X, this.P1.Y);
                ctx.lineTo(this.x, this.P1.Y);
                ctx.closePath();
                ctx.stroke();

                ctx.fillStyle = "black";
                ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
                ctx.textAlign = "left";
                ctx.textBaseline = 'middle';

                //var textWidth = ctx.measureText(this.Planet.BoundingHex.Id);
                ctx.fillText("z", this.x + Hexagon.x1 / 2 - 8, this.y + Hexagon.y1 / 2);
                ctx.fillText("x", this.x + Hexagon.x1 / 2, this.P1.Y + 10);
                ctx.fillText("y", this.P1.X + 2, this.y + Hexagon.y1 / 2);
                ctx.fillText("z = " + Hexagon.Side, this.P1.X, this.P1.Y + Hexagon.y1 + 10);
                ctx.fillText("(" + Hexagon.x1.toFixed(2) + "," + Hexagon.y1.toFixed(2) + ")", this.P1.X, this.P1.Y + 10);
            }
        };

        Hexagon.prototype.drawSelection = function (ctx) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(this.Points[0].X, this.Points[0].Y);
            for (var i = 1; i < this.Points.length; i++) {
                var p = this.Points[i];
                ctx.lineTo(p.X, p.Y);
            }
            ctx.closePath();
            ctx.stroke();
        };

        Hexagon.prototype.isInBounds = function (x, y) {
            return this.Contains(new HexMaps.Point(x, y));
        };

        Hexagon.prototype.isInHexBounds = function (p) {
            if (this.TopLeftPoint.X < p.X && this.TopLeftPoint.Y < p.Y && p.X < this.BottomRightPoint.X && p.Y < this.BottomRightPoint.Y) {
                return true;
            }
            return false;
        };

        Hexagon.prototype.Contains = function (p) {
            var isIn = false;

            if (this.isInHexBounds(p)) {
                var i, j = 0;
                for (i = 0, j = this.Points.length - 1; i < this.Points.length; j = i++) {
                    var iP = this.Points[i];
                    var jP = this.Points[j];
                    if ((((iP.Y <= p.Y) && (p.Y < jP.Y)) || ((jP.Y <= p.Y) && (p.Y < iP.Y))) && (p.X < (jP.X - iP.X) * (p.Y - iP.Y) / (jP.Y - iP.Y) + iP.X)) {
                        isIn = !isIn;
                    }
                }
            }

            return isIn;
        };

        Hexagon.prototype.distanceFromMidPoint = function (p) {
            var deltaX = this.MidPoint.X - p.X;
            var deltaY = this.MidPoint.Y - p.Y;

            return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
        };
        Hexagon.Width = 91.14378277661477;
        Hexagon.Height = 91.14378277661477;
        Hexagon.Side = 50.0;
        Hexagon.ORIENTATION = 0 /* FlatTopped */;
        Hexagon.DRAWSTATS = false;
        return Hexagon;
    })();
    OldHexMaps.Hexagon = Hexagon;

    /**
    * A Grid is the model of the playfield containing hexes
    * @constructor
    */
    var Grid = (function () {
        function Grid(width, height) {
            this.Hexes = new Array();

            var HexagonsByXOrYCoOrd = {};

            var row = 0;
            var y = 0.0;

            while (y + Hexagon.Height <= height) {
                var col = 0;

                var offset = 0.0;
                if (row % 2 == 1) {
                    if (Hexagon.ORIENTATION == 0 /* FlatTopped */)
                        offset = (Hexagon.Width - Hexagon.Side) / 2 + Hexagon.Side;
                    else
                        offset = Hexagon.Width / 2;
                    col = 1;
                }

                var x = offset;
                while (x + Hexagon.Width <= width) {
                    var hexId = this.GetHexId(row, col);
                    var h = new Hexagon(hexId, x, y);

                    var pathCoOrd = col;
                    if (Hexagon.ORIENTATION == 0 /* FlatTopped */)
                        h.PathCoOrdX = col; //the column is the x coordinate of the hex, for the y coordinate we need to get more fancy
                    else {
                        h.PathCoOrdY = row;
                        pathCoOrd = row;
                    }

                    this.Hexes.push(h);

                    if (!HexagonsByXOrYCoOrd[pathCoOrd])
                        HexagonsByXOrYCoOrd[pathCoOrd] = [];
                    HexagonsByXOrYCoOrd[pathCoOrd].push(h);

                    col += 2;
                    if (Hexagon.ORIENTATION == 0 /* FlatTopped */)
                        x += Hexagon.Width + Hexagon.Side;
                    else
                        x += Hexagon.Width;
                }
                row++;
                if (Hexagon.ORIENTATION == 0 /* FlatTopped */)
                    y += Hexagon.Height / 2;
                else
                    y += (Hexagon.Height - Hexagon.Side) / 2 + Hexagon.Side;
            }

            for (var coOrd1 in HexagonsByXOrYCoOrd) {
                var hexagonsByXOrY = HexagonsByXOrYCoOrd[coOrd1];
                var coOrd2 = Math.floor(coOrd1 / 2) + (coOrd1 % 2);
                for (var i in hexagonsByXOrY) {
                    var h = hexagonsByXOrY[i];
                    if (Hexagon.ORIENTATION == 0 /* FlatTopped */)
                        h.PathCoOrdY = coOrd2++;
                    else
                        h.PathCoOrdX = coOrd2++;
                }
            }
        }
        Grid.prototype.GetHexId = function (row, col) {
            var letterIndex = row;
            var letters = "";
            while (letterIndex > 25) {
                letters = Grid.Letters[letterIndex % 26] + letters;
                letterIndex -= 26;
            }

            return Grid.Letters[letterIndex] + letters + (col + 1);
        };

        /**
        * Returns a hex at a given point
        * @this {HexGrid.Grid}
        * @return {HexGrid.Hexagon}
        */
        Grid.prototype.GetHexAt = function (p) {
            for (var h in this.Hexes) {
                if (this.Hexes[h].Contains(p)) {
                    return this.Hexes[h];
                }
            }

            return null;
        };

        /**
        * Returns a distance between two hexes
        * @this {HexGrid.Grid}
        * @return {number}
        */
        Grid.prototype.GetHexDistance = function (h1, h2) {
            //a good explanation of this calc can be found here:
            //http://playtechs.blogspot.com/2007/04/hex-grids.html
            var deltaX = h1.PathCoOrdX - h2.PathCoOrdX;
            var deltaY = h1.PathCoOrdY - h2.PathCoOrdY;
            return ((Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaX - deltaY)) / 2);
        };

        /**
        * Returns a distance between two hexes
        * @this {HexGrid.Grid}
        * @return {HexGrid.Hexagon}
        */
        Grid.prototype.GetHexById = function (id) {
            for (var i in this.Hexes) {
                if (this.Hexes[i].Id == id) {
                    return this.Hexes[i];
                }
            }
            return null;
        };

        /**
        * Returns the nearest hex to a given point
        * Provided by: Ian (Disqus user: boingy)
        * @this {HexGrid.Grid}
        * @param {HexGrid.Point} p the test point
        * @return {HexGrid.Hexagon}
        */
        Grid.prototype.GetNearestHex = function (p) {
            var distance;
            var minDistance = Number.MAX_VALUE;
            var hx = null;

            for (var h in this.Hexes) {
                distance = this.Hexes[h].distanceFromMidPoint(p);

                if (distance < minDistance) {
                    minDistance = distance;
                    hx = this.Hexes[h];
                }
            }

            return hx;
        };
        Grid.Letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return Grid;
    })();
    OldHexMaps.Grid = Grid;
})(OldHexMaps || (OldHexMaps = {}));
//# sourceMappingURL=OldHex.js.map
