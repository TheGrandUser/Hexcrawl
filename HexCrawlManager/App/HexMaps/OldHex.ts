/**
 * Translated to Typescript from https://github.com/mpalmerlee/HexagonTools/tree/master/js
 */

module OldHexMaps {
    
    export class Hexagon {
        static Width = 91.14378277661477
        static Height = 91.14378277661477;
        static Side = 50.0;
        static ORIENTATION: HexMaps.Orientation = HexMaps.Orientation.FlatTopped;
        static DRAWSTATS = false;

        static get VertexToVertex(): number {
            if (Hexagon.ORIENTATION === HexMaps.Orientation.FlatTopped) {
                return Hexagon.Width;
            } else {
                return Hexagon.Height;
            }
        }

        static get EdgeToEdge(): number {
            if (Hexagon.ORIENTATION === HexMaps.Orientation.FlatTopped) {
                return Hexagon.Height;
            } else {
                return Hexagon.Width;
            }
        }

        static get x1(): number {
            if (Hexagon.ORIENTATION === HexMaps.Orientation.FlatTopped) {
                return (Hexagon.Width - Hexagon.Side) / 2;
            }
            else {
                return (Hexagon.Width / 2);
            }
        }
        static get y1(): number {
            if (Hexagon.ORIENTATION === HexMaps.Orientation.FlatTopped) {
                return (Hexagon.Height / 2);
            }
            else {
                return (Hexagon.Height - Hexagon.Side) / 2;
            }
        }

        //static set EqualateralSize(edgeToEdgeSize: number) {

        //    Hexagon.Side = edgeToEdgeSize / Math.sqrt(3);

        //    if (Hexagon.ORIENTATION == Orientation.FlatTopped) {
        //        Hexagon.VertexToVertex = edgeToEdgeSize;
        //        Hexagon.EdgeToEdge = 2 * Hexagon.Side;
        //    }
        //    else {
        //        Hexagon.EdgeToEdge = edgeToEdgeSize;
        //        Hexagon.VertexToVertex = 2 * Hexagon.Side;
        //    }
        //}

        public Id: string;
        public Points: HexMaps.Point[];
        public selected: boolean;

        public PathCoOrdX: number = null;
        public PathCoOrdY: number = null;

        public Color: string = "white";

        get TopLeftPoint(): HexMaps.Point { return new HexMaps.Point(this.x, this.y); }
        get BottomRightPoint(): HexMaps.Point { return new HexMaps.Point(this.x + Hexagon.Width, this.y + Hexagon.Height); }
        get MidPoint(): HexMaps.Point { return new HexMaps.Point(this.x + (Hexagon.Width / 2), this.y + (Hexagon.Height / 2)); }

        get P1(): HexMaps.Point { return new HexMaps.Point(this.x + Hexagon.x1, this.y + Hexagon.y1); }

        constructor(id: string, public x: number, public y: number) {
            this.Points = [];

            if (Hexagon.ORIENTATION == HexMaps.Orientation.FlatTopped) {
                this.Points.push(new HexMaps.Point(Hexagon.x1 + x, y));
                this.Points.push(new HexMaps.Point(Hexagon.x1 + Hexagon.Side + x, y));
                this.Points.push(new HexMaps.Point(Hexagon.Width + x, Hexagon.y1 + y));
                this.Points.push(new HexMaps.Point(Hexagon.x1 + Hexagon.Side + x, Hexagon.Height + y));
                this.Points.push(new HexMaps.Point(Hexagon.x1 + x, Hexagon.Height + y));
                this.Points.push(new HexMaps.Point(x, Hexagon.y1 + y));
            }
            else {
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

        draw(ctx: CanvasRenderingContext2D) {

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
        }

        drawSelection(ctx: CanvasRenderingContext2D) {
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
        }

        isInBounds(x: number, y: number): boolean { return this.Contains(new HexMaps.Point(x, y)); }

        isInHexBounds(p: HexMaps.Point): boolean {
            if (this.TopLeftPoint.X < p.X && this.TopLeftPoint.Y < p.Y &&
                p.X < this.BottomRightPoint.X && p.Y < this.BottomRightPoint.Y) {
                return true;
            }
            return false;
        }

        Contains(p: HexMaps.Point): boolean {
            var isIn = false;

            if (this.isInHexBounds(p)) {
                var i, j = 0;
                for (i = 0, j = this.Points.length - 1; i < this.Points.length; j = i++) {
                    var iP = this.Points[i];
                    var jP = this.Points[j];
                    if (
                        (
                        ((iP.Y <= p.Y) && (p.Y < jP.Y)) ||
                        ((jP.Y <= p.Y) && (p.Y < iP.Y))
                        ) &&
                        (p.X < (jP.X - iP.X) * (p.Y - iP.Y) / (jP.Y - iP.Y) + iP.X)
                        ) {
                        isIn = !isIn;
                    }
                }
            }

            return isIn;
        }

        distanceFromMidPoint(p: HexMaps.Point): number {
            var deltaX = this.MidPoint.X - p.X;
            var deltaY = this.MidPoint.Y - p.Y;

            return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
        }
    }

    /**
     * A Grid is the model of the playfield containing hexes
     * @constructor
     */
    export class Grid {

        static Letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        Hexes: Array<Hexagon>;

        constructor(width: number, height: number) {
            this.Hexes = new Array<Hexagon>();

            var HexagonsByXOrYCoOrd = {};

            var row = 0;
            var y = 0.0;

            while (y + Hexagon.Height <= height) {
                var col = 0;



                var offset = 0.0;
                if (row % 2 == 1) {
                    if (Hexagon.ORIENTATION == HexMaps.Orientation.FlatTopped)
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
                    if (Hexagon.ORIENTATION == HexMaps.Orientation.FlatTopped)
                        h.PathCoOrdX = col;//the column is the x coordinate of the hex, for the y coordinate we need to get more fancy
                    else {
                        h.PathCoOrdY = row;
                        pathCoOrd = row;
                    }


                    this.Hexes.push(h);


                    if (!HexagonsByXOrYCoOrd[pathCoOrd])
                        HexagonsByXOrYCoOrd[pathCoOrd] = [];
                    HexagonsByXOrYCoOrd[pathCoOrd].push(h);


                    col += 2;
                    if (Hexagon.ORIENTATION == HexMaps.Orientation.FlatTopped)
                        x += Hexagon.Width + Hexagon.Side;
                    else
                        x += Hexagon.Width;
                }
                row++;
                if (Hexagon.ORIENTATION == HexMaps.Orientation.FlatTopped)
                    y += Hexagon.Height / 2;
                else
                    y += (Hexagon.Height - Hexagon.Side) / 2 + Hexagon.Side;
            }

            //finally go through our list of hexagons by their x co-ordinate to assign the y co-ordinate
            for (var coOrd1 in HexagonsByXOrYCoOrd) {
                var hexagonsByXOrY = HexagonsByXOrYCoOrd[coOrd1];
                var coOrd2 = Math.floor(coOrd1 / 2) + (coOrd1 % 2);
                for (var i in hexagonsByXOrY) {
                    var h: Hexagon = hexagonsByXOrY[i];
                    if (Hexagon.ORIENTATION == HexMaps.Orientation.FlatTopped)
                        h.PathCoOrdY = coOrd2++;
                    else
                        h.PathCoOrdX = coOrd2++;
                }
            }
        }

        GetHexId(row: number, col: number): string {
            var letterIndex = row;
            var letters = "";
            while (letterIndex > 25) {
                letters = Grid.Letters[letterIndex % 26] + letters;
                letterIndex -= 26;
            }

            return Grid.Letters[letterIndex] + letters + (col + 1);
        }

        /**
         * Returns a hex at a given point
         * @this {HexGrid.Grid}
         * @return {HexGrid.Hexagon}
         */
        GetHexAt(p: HexMaps.Point): Hexagon {
            //find the hex that contains this point
            for (var h in this.Hexes) {
                if (this.Hexes[h].Contains(p)) {
                    return this.Hexes[h];
                }
            }

            return null;
        }

        /**
         * Returns a distance between two hexes
         * @this {HexGrid.Grid}
         * @return {number}
         */
        GetHexDistance(h1: Hexagon, h2: Hexagon): number {
            //a good explanation of this calc can be found here:
            //http://playtechs.blogspot.com/2007/04/hex-grids.html
            var deltaX = h1.PathCoOrdX - h2.PathCoOrdX;
            var deltaY = h1.PathCoOrdY - h2.PathCoOrdY;
            return ((Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaX - deltaY)) / 2);
        }

        /**
         * Returns a distance between two hexes
         * @this {HexGrid.Grid}
         * @return {HexGrid.Hexagon}
         */
        GetHexById(id: string): Hexagon {
            for (var i in this.Hexes) {
                if (this.Hexes[i].Id == id) {
                    return this.Hexes[i];
                }
            }
            return null;
        }

        /**
        * Returns the nearest hex to a given point
        * Provided by: Ian (Disqus user: boingy)
        * @this {HexGrid.Grid}
        * @param {HexGrid.Point} p the test point 
        * @return {HexGrid.Hexagon}
        */
        GetNearestHex(p: HexMaps.Point): Hexagon {

            var distance;
            var minDistance = Number.MAX_VALUE;
            var hx = null;

            // iterate through each hex in the grid
            for (var h in this.Hexes) {
                distance = this.Hexes[h].distanceFromMidPoint(p);


                if (distance < minDistance) // if this is the nearest thus far
                {
                    minDistance = distance;
                    hx = this.Hexes[h];
                }
            }

            return hx;
        }
    }

}