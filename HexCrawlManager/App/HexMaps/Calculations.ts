/// <reference path="modeltypes.ts" />

module OldHexMaps {

    'use strict';

    export function findRegularHexWithHeight(height: number) {
        
        var angle = Math.PI / 6;

        var y = height / 2;
        var x = Math.tan(angle) * y;

        var z = Math.sqrt(x * x + y * y);

        var width = 2 * x + z;

        var contentDiv = document.getElementById("hexStatus");

        contentDiv.innerHTML = "Values for Hex: <br /><b>Width:</b> " + width + "<br /><b>Height: </b>" + height +
        "<br /><b>Side Length, z:</b> " + z + "<br /><b>x:</b> " + x + "<br /><b>y:</b> " + y;

        Hexagon.Width = width;
        Hexagon.Height = height;
        Hexagon.Side = z;
    }

    export function drawHexGrid() {

        var canvas = <HTMLCanvasElement>document.getElementById("hexCanvas");
        var width = canvas.width;
        var height = canvas.height;
        var grid = new Grid(width, height);
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        //ctx.scale(1, 1);
        //ctx.setTransform(1, 0, 0, 1, 0, 0);
        for (var h in grid.Hexes) {
            grid.Hexes[h].draw(ctx);
        }
    }

    export function changeOrientation() {
        var hexOrient = <HTMLInputElement>document.getElementById("hexOrientationNormal");
        if (hexOrient.checked) {
            Hexagon.ORIENTATION = HexMaps.Orientation.FlatTopped;
        }
        else {
            Hexagon.ORIENTATION = HexMaps.Orientation.PointyTopped;
        }
        drawHexGrid();
    }
} 