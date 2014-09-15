console.log("Hex draw.ts");

//$(function () {
console.log("Starting hexes");

HexMap.findHexWithHeightAndAngle();

var canvas = document.getElementById("hexCanvas");
var clickStatus = document.getElementById("debugInfo");

var width = canvas.width;
var height = canvas.height;
var grid = new HexMap.Grid(width, height);

var ctx = canvas.getContext('2d');

var selectedHex = null;

canvas.onclick = function (ev) {
    if (selectedHex) {
        selectedHex.selected = false;
        selectedHex = null;
    }

    var hex = grid.GetHexAt(new HexMap.Point(ev.offsetX, ev.offsetY));

    console.log(ev);

    if (hex) {
        selectedHex = hex;
        selectedHex.selected = true;

        clickStatus.innerHTML = "Selected hex: " + hex.Id + "<br />Mouse x: " + ev.offsetX + "<br />Mouse y: " + ev.offsetY;
    } else {
        clickStatus.innerHTML = "No hex selected<br />Mouse x: " + ev.offsetX + "<br />Mouse y: " + ev.offsetY;
    }

    drawHexGrid();
};

drawHexGrid();

function drawHexGrid() {
    console.log("drawing hexes");
    ctx.clearRect(0, 0, width, height);

    for (var h in grid.Hexes) {
        if (grid.Hexes[h] === selectedHex) {
            continue;
        }
        grid.Hexes[h].draw(ctx);
    }

    if (selectedHex) {
        selectedHex.draw(ctx);
    }
}
//});
//# sourceMappingURL=HexDraw.js.map
