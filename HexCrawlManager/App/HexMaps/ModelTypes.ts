/// <reference path="../../scripts/rx.d.ts" />
/// <reference path="../../scripts/rx.async.d.ts" />
/// <reference path="../../scripts/rx.binding.d.ts" />
/// <reference path="../../scripts/rx.time.d.ts" />

module HexMaps {

    'use strict';

    export var SQRT3 = Math.sqrt(3);
    export var SQRT3_3 = Math.sqrt(3) / 3;

    export enum Orientation { FlatTopped, PointyTopped }

    export enum MapShape { Rectangular, Triangle, Hex, Rhombus }

    export enum Direction {
        UpXDownY,
        UpXDownZ,
        UpYDownZ,
        UpYDownX,
        UpZDownX,
        UpZDownY
    }
    /**
     * A point is simply x and y coordinates
     */
    export class Point {
        constructor(public X: number, public Y: number) { }

        add(p: Point): Point {
            return new Point(this.X + p.X, this.Y + p.Y);
        }

        addX(x: number): Point {
            return new Point(this.X + x, this.Y);
        }

        addY(y: number): Point {
            return new Point(this.X, this.Y + y);
        }

        sub(p: Point): Point {
            return new Point(this.X - p.X, this.Y - p.Y);
        }
    }

    export class Rectangle {
        constructor(public X: number, public Y: number,
            public width: number, public height: number) { }
    }

    export class Line {
        constructor(public X1: number, public Y1: number,
            public X2: number, public Y2: number) { }
    }

    export class CubeCoord {
        constructor(public x: number, public y: number, public z: number) {
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

        toAxialCoord(): AxialCoord {
            return new AxialCoord(this.x, this.z);
        }

        static neighbors = [
            [+1, -1, 0], [+1, 0, -1], [0, +1, -1],
            [-1, +1, 0], [-1, 0, +1], [0, -1, +1]
        ];

        getNeighbor(direction: Direction): CubeCoord {
            var d = CubeCoord.neighbors[direction];

            return new CubeCoord(this.x + d[0], this.y + d[1], this.z + d[2]);
        }

        toPixel(orientation: Orientation = Orientation.FlatTopped): Point {
            var size = HexagonDefinition.SideLength;
            if (orientation === Orientation.FlatTopped) {
                var x = size * 3 / 2 * this.x;
                var y = size * HexMaps.SQRT3 * (this.z + this.x / 2);
                return new Point(x, y);
            } else {
                var x = size * HexMaps.SQRT3 * (this.x + this.z / 2);
                var y = size * 3 / 2 * this.z;
                return new Point(x, y);
            }
        }

        static fromPoint(point: Point, orientation: Orientation = Orientation.FlatTopped): CubeCoord {
            return getCoordAtPoint(point, orientation);
        }
    }

    export class AxialCoord {
        constructor(public q: number, public r: number) {
        }

        isSame(other: AxialCoord): boolean {
            return this.q === other.q && this.r === other.r;
        }

        toCubeCoord(): CubeCoord {
            return new CubeCoord(this.q, -this.q - this.r, this.r);
        }

        static neighbors = [
            [+1, 0], [+1, -1], [0, -1],
            [-1, 0], [-1, +1], [0, +1]
        ];

        getNeighbor(direction: Direction): AxialCoord {
            var d = AxialCoord.neighbors[direction];

            return new AxialCoord(this.q + d[0], this.r + d[1])
        }

        toPixel(orientation: Orientation = Orientation.FlatTopped): Point {
            var size = HexagonDefinition.SideLength;
            if (orientation === Orientation.FlatTopped) {
                var x = size * 3 / 2 * this.q;
                var y = size * HexMaps.SQRT3 * (this.r + this.q / 2);
                return new Point(x, y);
            } else {
                var x = size * HexMaps.SQRT3 * (this.r + this.q / 2);
                var y = size * 3 / 2 * this.r;
                return new Point(x, y);
            }
        }

        static fromPoint(point: Point, orientation: Orientation = Orientation.FlatTopped): AxialCoord {
            return getCoordAtPoint(point, orientation).toAxialCoord();
        }
    }

    export class HexRectangle {
        upperLeft: AxialCoord;
        upperRight: AxialCoord;
        lowerLeft: AxialCoord;
        lowerRight: AxialCoord;

        upperEdgeDownFirst: boolean;
        leftEdgeOffsetLeftOne: boolean;
        lowerEdgeDownFirst: boolean;
        rightEdgeOffsetRightOne: boolean;

        worldRect: Rectangle;
        orientation: Orientation;

        constructor(rect: Rectangle, orientation: Orientation = Orientation.FlatTopped) {

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
        }

        isInBounds(coord: AxialCoord): boolean {
            // flat topped
            if (coord.q < this.upperLeft.q) {
                return this.leftEdgeOffsetLeftOne &&
                    coord.q === (this.upperLeft.q - 1) &&
                    coord.r > this.upperLeft.r &&
                    coord.r < this.lowerLeft.r + 1;
            }

            if (coord.q > this.upperRight.q) {

                return this.rightEdgeOffsetRightOne &&
                    coord.q === (this.upperLeft.q + 1) &&
                    coord.r > this.upperRight.r - 1 &&
                    coord.r < this.lowerRight.r;
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
        }

        forEachCoord(action: (coord: AxialCoord) => void): void {
            // flat topped

            if (this.leftEdgeOffsetLeftOne) {
                var current = this.upperLeft.getNeighbor(4);
                
                for (var r = current.r; r < this.lowerLeft.r + 1; r++) {
                    action(new AxialCoord(current.q, r));
                }
            }

            var upperAdjust = this.upperEdgeDownFirst ? 1 : 0;
            var lowerAdjust = this.lowerEdgeDownFirst ? 1 : 0;

            for (var q = this.upperLeft.q; q < this.upperRight.q + 1; q++) {
                var upperR = Math.floor(this.upperLeft.r - (q - this.upperLeft.q - upperAdjust) / 2);
                var lowerR = Math.floor(this.lowerLeft.r - (q - this.lowerLeft.q - lowerAdjust) / 2);

                for (var r = upperR; r < lowerR + 1; r++) {
                    action(new AxialCoord(q, r));
                }
            }

            if (this.rightEdgeOffsetRightOne) {
                var current = this.upperRight.getNeighbor(0);
                
                for (var r = current.r; r < this.lowerRight.r + 1; r++) {
                    action(new AxialCoord(current.q, r));
                }
            }
        }
    }

    function getCoordAtPoint(worldPoint: Point, orientation: Orientation): CubeCoord {

        //var point = new Point(worldPoint.X + HexWidth(orientation), worldPoint.Y + HexHeight(orientation));
        var point = worldPoint;

        var size = HexagonDefinition.SideLength;

        var aq: number;
        var ar: number;
        if (orientation === Orientation.FlatTopped) {
            aq = 2 / 3 * point.X / size;
            ar = (-1 / 3 * point.X + HexMaps.SQRT3_3 * point.Y) / size;
        } else {
            aq = (HexMaps.SQRT3_3 * point.X - 1 / 3 * point.Y) / size;
            ar = 2 / 3 * point.Y / size;
        }

        return hexRound(aq, -aq - ar, ar);
    }


    export function hexRound(x: number, y: number, z: number): CubeCoord {

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


    export class HexagonDefinition {

        static VertexToVertex = 91.14378277661477;
        static EdgeToEdge = 91.14378277661477;
        static SideLength = 50.0;
        static Flare = 5.0;

        static FlatTopPoints: Array<Point>;
        static PointyTopPoints: Array<Point>;

        static get alternatingDifference(): number {
            return 3 / 4 * HexagonDefinition.VertexToVertex;
        }

        static SetupHexStatics(edgeToEdge: number): void {

            var angle = Math.PI / 6;

            var y = edgeToEdge / 2;
            var x = Math.tan(angle) * y;

            var z = Math.sqrt(x * x + y * y);

            var vertexToVertex = 2 * x + z;

            HexagonDefinition.VertexToVertex = vertexToVertex;
            HexagonDefinition.EdgeToEdge = edgeToEdge;
            HexagonDefinition.SideLength = z;
            HexagonDefinition.Flare = x;

            HexagonDefinition.FlatTopPoints = [
                new HexMaps.Point(-vertexToVertex / 2, 0), // middle left
                new HexMaps.Point(-z / 2, -y), // top left
                new HexMaps.Point(z / 2, -y), // top right
                new HexMaps.Point(vertexToVertex / 2, 0), // middle right
                new HexMaps.Point(z / 2, y), // bottom right
                new HexMaps.Point(-z / 2, y), // bottom left
            ];

            HexagonDefinition.PointyTopPoints = [
                new Point(y, 0), // top middle
                new Point(edgeToEdge, x), // top right
                new Point(edgeToEdge, x + z), // bottom right
                new Point(y, vertexToVertex), // bottom middle
                new Point(0, x + z), // bottom left
                new Point(0, x), // top left
            ];
            
            //var contentDiv = document.getElementById("hexStatus");
            //contentDiv.innerHTML = "Values for Hex: <br /><b>Vertex to Vertex:</b> " + vertexToVertex + "<br /><b>Edge to Edge: </b>" + edgeToEdge + "<br /><b>Side Length, z:</b> " + z + "<br /><b>x:</b> " + x + "<br /><b>y:</b> " + y;
        }

        constructor(public color: string, public name: string) {

        }
    }

    export function getHexWidth(ori: Orientation = Orientation.FlatTopped): number {
        if (ori === Orientation.FlatTopped) {
            return HexagonDefinition.VertexToVertex;
        } else {
            return HexagonDefinition.EdgeToEdge;
        }
    }

    export function getHexHeight(ori: Orientation = Orientation.FlatTopped): number {
        if (ori === Orientation.FlatTopped) {
            return HexagonDefinition.EdgeToEdge;
        } else {
            return HexagonDefinition.VertexToVertex;
        }
    }

    export class HexTile {
        definition: HexagonDefinition;
        private c: AxialCoord = null;
        private midPoint: Point = null;

        get coord(): AxialCoord { return this.c; }
        set coord(value: AxialCoord) {
            this.c = value;
            if (this.c) {
                this.midPoint = this.c.toPixel();
            } else {
                this.midPoint = null;
            }
        }

        constructor(def: HexagonDefinition, coord?: AxialCoord) {
            this.definition = def;
            this.coord = coord;

            if (this.coord) {
                this.midPoint = this.coord.toPixel();
            }
        }

        draw(ctx: CanvasRenderingContext2D, offset: Point, highlight: boolean = false): void {
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
            ctx.moveTo(
                hexPoints[0].X + point.X,
                hexPoints[0].Y + point.Y);

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
        }

        drawSelection(ctx: CanvasRenderingContext2D, offset: Point): void {
            var point = this.midPoint.sub(offset);
            var hexPoints = HexagonDefinition.FlatTopPoints;

            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(
                hexPoints[0].X + point.X,
                hexPoints[0].Y + point.Y);

            for (var i = 1; i < hexPoints.length; i++) {
                var p = hexPoints[i];
                ctx.lineTo(p.X + point.X, p.Y + point.Y);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }

    export class HexTileStrip {
        constructor(public offset: number, public tiles: Array<HexTile>) {
        }
    }

    export class HexTileMap {
        hexes: Array<HexTileStrip>;
        shape: MapShape;

        minR: number;
        maxR: number;

        minQ: number;
        maxQ: number;

        constructor(public width: number, public height: number, fillHex: HexagonDefinition) {
            this.shape = MapShape.Rectangular;

            // Flat Topped

            this.minQ = 0;
            this.maxQ = width;

            this.minR = -Math.floor(this.width / 2);
            this.maxR = height;

            this.hexes = new Array(this.width);

            for (var colIndex = 0; colIndex < this.width; colIndex++) {
                var firstRow: number;
                var numberOfTiles: number;

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

        hexAt(coord: AxialCoord): HexTile {

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
        }

        setHex(coord: AxialCoord, hexDef: HexagonDefinition): void {

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
        }

        draw(ctx: CanvasRenderingContext2D, offset: Point) {

        }

        getLowerRightCoord(): AxialCoord {
            var q = this.hexes.length - 1;
            var r = Math.floor(-q / 2) + this.height;
            return new AxialCoord(q, r);
        }
    }
}