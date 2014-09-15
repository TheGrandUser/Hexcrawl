/// <reference path="modeltypes.ts" />
var OldHexMaps;
(function (OldHexMaps) {
    'use strict';

    function findRegularHexWithHeight(height) {
        var angle = Math.PI / 6;

        var y = height / 2;
        var x = Math.tan(angle) * y;

        var z = Math.sqrt(x * x + y * y);

        var width = 2 * x + z;

        var contentDiv = document.getElementById("hexStatus");

        contentDiv.innerHTML = "Values for Hex: <br /><b>Width:</b> " + width + "<br /><b>Height: </b>" + height + "<br /><b>Side Length, z:</b> " + z + "<br /><b>x:</b> " + x + "<br /><b>y:</b> " + y;

        OldHexMaps.Hexagon.Width = width;
        OldHexMaps.Hexagon.Height = height;
        OldHexMaps.Hexagon.Side = z;
    }
    OldHexMaps.findRegularHexWithHeight = findRegularHexWithHeight;

    function drawHexGrid() {
        var canvas = document.getElementById("hexCanvas");
        var width = canvas.width;
        var height = canvas.height;
        var grid = new OldHexMaps.Grid(width, height);
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        for (var h in grid.Hexes) {
            grid.Hexes[h].draw(ctx);
        }
    }
    OldHexMaps.drawHexGrid = drawHexGrid;

    function changeOrientation() {
        var hexOrient = document.getElementById("hexOrientationNormal");
        if (hexOrient.checked) {
            OldHexMaps.Hexagon.ORIENTATION = 0 /* FlatTopped */;
        } else {
            OldHexMaps.Hexagon.ORIENTATION = 1 /* PointyTopped */;
        }
        drawHexGrid();
    }
    OldHexMaps.changeOrientation = changeOrientation;
})(OldHexMaps || (OldHexMaps = {}));
//# sourceMappingURL=Calculations.js.map
