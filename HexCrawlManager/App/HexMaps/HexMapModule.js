/// <reference path="../../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="modeltypes.ts" />
var HexMaps;
(function (HexMaps) {
    'use strict';

    var HexMapController = (function () {
        function HexMapController($scope, hexMapService) {
            this.$scope = $scope;
            $scope.edgeToEdge = HexMaps.HexagonDefinition.EdgeToEdge;
            $scope.vertexToVertex = HexMaps.HexagonDefinition.VertexToVertex;
            $scope.side = HexMaps.HexagonDefinition.SideLength;
        }
        HexMapController.$inject = ['$scope', 'hexMapService'];
        return HexMapController;
    })();
    HexMaps.HexMapController = HexMapController;

    function SelectHexMapDirective(hexMapInteractionService, cameraService) {
        console.log("Creating a selectHexMap directive!");
        return {
            restrict: "A",
            link: function (scope, element) {
                console.log("Linking a selectHexMap directive!");

                var offsetLeft = element[0].offsetLeft;
                var offsetTop = element[0].offsetTop;
                var mouseDown = new HexMaps.Point(0, 0);
                var lastMousePos = new HexMaps.Point(0, 0);

                var mouseDrag = false;

                element.bind('mousedown', function (event) {
                    if (event.button === 0) {
                        //var currentTarget: any = event.currentTarget;
                        //console.log("Mouse click at " + event.clientX + ", " + event.clientY);
                        //console.log("     offset at " + event.offsetX + ", " + event.offsetY);
                        //console.log(" target offset " + currentTarget.offsetLeft + ", " + currentTarget.offsetTop);
                        //console.log("   target size " + currentTarget.width + ", " + currentTarget.height);
                        mouseDown = new HexMaps.Point(event.offsetX, event.offsetY);
                        lastMousePos = new HexMaps.Point(event.offsetX, event.offsetY);
                        mouseDrag = true;
                    } else if (event.button === 2) {
                        event.preventDefault();
                    }
                });

                element.bind('mouseup', function (event) {
                    if (event.button === 0) {
                        if (lastMousePos.X === mouseDown.X || lastMousePos.Y === mouseDown.Y) {
                            hexMapInteractionService.makeSelection(mouseDown);
                        }
                        mouseDrag = false;
                    } else if (event.button === 2) {
                        event.preventDefault();
                    }
                });

                element.bind('mousemove', function (event) {
                    if (mouseDrag) {
                        var newMousePos = new HexMaps.Point(event.offsetX, event.offsetY);
                        var diff = newMousePos.sub(lastMousePos);

                        lastMousePos = newMousePos;

                        cameraService.position = cameraService.position.add(diff);
                        hexMapInteractionService.doRender();
                    }
                });
            }
        };
    }
    HexMaps.SelectHexMapDirective = SelectHexMapDirective;
    SelectHexMapDirective.$inject = ['hexMapInteractionService', 'cameraService'];

    function DrawHexMapDirective(hexMapInteractionService, cameraService) {
        console.log("Creating a drawHexMap directive!");

        return {
            restrict: "A",
            link: function (scope, element) {
                console.log("Linking a drawHexMap directive!");

                var canvas = element[0];
                var ctx = canvas.getContext('2d');

                var width = canvas.width;
                var height = canvas.height;

                hexMapInteractionService.renderMap = function (map) {
                    console.log("drawing hexes");
                    ctx.clearRect(0, 0, width, height);

                    var cameraOffset = cameraService.position.sub(cameraService.debugOffset);

                    var screenRect = new HexMaps.Rectangle(cameraService.position.X, cameraService.position.Y, cameraService.width, cameraService.height);

                    var hexRect = new HexMaps.HexRectangle(screenRect);
                    hexRect.forEachCoord(function (coord) {
                        var tile = map.hexAt(coord);
                        if (tile) {
                            tile.draw(ctx, cameraService.debugOffset, hexRect.isInBounds(tile.coord));
                        }
                    });

                    if (hexMapInteractionService.selectedHex && hexRect.isInBounds(hexMapInteractionService.selectedHex.coord)) {
                        hexMapInteractionService.selectedHex.drawSelection(ctx, cameraService.debugOffset);
                    }

                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "cyan";
                    ctx.strokeRect(cameraOffset.X, cameraOffset.Y, screenRect.width, screenRect.height);
                };

                hexMapInteractionService.startRenderLoop();
            }
        };
    }
    HexMaps.DrawHexMapDirective = DrawHexMapDirective;
    DrawHexMapDirective.$inject = ['hexMapInteractionService', 'cameraService'];

    var HexTileDefinitions = (function () {
        function HexTileDefinitions() {
            this.defaultHex = new HexMaps.HexagonDefinition("LightGray");
            this.redHex = new HexMaps.HexagonDefinition("Red");
            this.greenHex = new HexMaps.HexagonDefinition("Green");
            this.blueHex = new HexMaps.HexagonDefinition("Blue");
            this.hexes = new Map();
            this.hexes.set("Default", this.defaultHex);
            this.hexes.set("Red", this.redHex);
            this.hexes.set("Green", this.greenHex);
            this.hexes.set("Blue", this.blueHex);
        }
        Object.defineProperty(HexTileDefinitions.prototype, "DefaultHex", {
            get: function () {
                return this.defaultHex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HexTileDefinitions.prototype, "RedTile", {
            get: function () {
                return this.redHex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HexTileDefinitions.prototype, "GreenTile", {
            get: function () {
                return this.greenHex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HexTileDefinitions.prototype, "BlueTile", {
            get: function () {
                return this.blueHex;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(HexTileDefinitions.prototype, "Hexes", {
            get: function () {
                return this.hexes;
            },
            enumerable: true,
            configurable: true
        });
        return HexTileDefinitions;
    })();
    HexMaps.HexTileDefinitions = HexTileDefinitions;

    var CameraService = (function () {
        function CameraService(hexMapService) {
            this.pos = new HexMaps.Point(0, 0);
            console.log("Creating cameraService");
            this.hexMapService = hexMapService;

            this.debugOffset = new HexMaps.Point(-HexMaps.getHexWidth(), -HexMaps.getHexHeight());
            this.width = 480;
            this.height = 320;
            this.position = new HexMaps.Point(196, 147);
        }
        Object.defineProperty(CameraService.prototype, "position", {
            get: function () {
                return this.pos;
            },
            set: function (value) {
                this.pos = value;

                var lowerRight = this.hexMapService.hexMap.getLowerRightCoord();
                var worldPoint = lowerRight.toPixel();

                if (this.pos.X < 0) {
                    this.pos.X = 0;
                } else if (this.pos.X + this.width > worldPoint.X) {
                    this.pos.X = worldPoint.X - this.width;
                }
                if (this.pos.Y < 0) {
                    this.pos.Y = 0;
                } else if (this.pos.Y + this.height > worldPoint.Y) {
                    this.pos.Y = worldPoint.Y - this.height;
                }
            },
            enumerable: true,
            configurable: true
        });
        return CameraService;
    })();
    HexMaps.CameraService = CameraService;

    var HexMapInteractionService = (function () {
        function HexMapInteractionService(hexMapService, cameraService) {
            this.selectedHex = null;
            this.isRenderingStarted = false;
            this.hexMapService = hexMapService;
            this.cameraService = cameraService;

            this.clickStatus = document.getElementById("debugInfo");
        }
        HexMapInteractionService.prototype.makeSelection = function (point) {
            console.log("A selection was made at " + point.X + ", " + point.Y);
            var worldPoint = point.add(this.cameraService.debugOffset);
            console.log("      World location at " + worldPoint.X + ", " + worldPoint.Y);

            if (this.selectedHex) {
                this.selectedHex = null;
            }

            var coord = HexMaps.AxialCoord.fromPoint(worldPoint);
            console.log("selected coord: q " + coord.q + ", r " + coord.r);

            var hex = this.hexMapService.hexMap.hexAt(coord);

            if (hex) {
                this.selectedHex = hex;
                this.clickStatus.innerHTML = "Selected hex: " + coord + "<br />Mouse x: " + worldPoint.X + "<br />Mouse y: " + worldPoint.Y + "<br />Coord q " + coord.q + ", r " + coord.r;
                console.log("selected hex " + coord);
            } else {
                this.clickStatus.innerHTML = "No hex selected<br />Mouse x: " + worldPoint.X + "<br />Mouse y: " + worldPoint.Y + "<br />Coord q " + coord.q + ", r " + coord.r;
                console.log("no hex selected");
            }

            if (this.isRenderingStarted) {
                this.renderMap(this.hexMapService.hexMap);
            }
        };

        HexMapInteractionService.prototype.doRender = function () {
            if (this.renderMap) {
                this.renderMap(this.hexMapService.hexMap);
            }
        };

        HexMapInteractionService.prototype.renderMap = function (map) {
        };

        HexMapInteractionService.prototype.startRenderLoop = function () {
            this.isRenderingStarted = true;
            this.renderMap(this.hexMapService.hexMap);
        };
        return HexMapInteractionService;
    })();
    HexMaps.HexMapInteractionService = HexMapInteractionService;

    var HexMapService = (function () {
        function HexMapService(hexTileDefinitions) {
            //grid: Grid;
            this.hexMap = null;
            var height = 60;

            HexMaps.HexagonDefinition.SetupHexStatics(height);

            this.hexMap = new HexMaps.HexTileMap(16, 14, hexTileDefinitions.DefaultHex);

            this.hexMap.setHex(new HexMaps.AxialCoord(2, 1), hexTileDefinitions.GreenTile);
        }
        return HexMapService;
    })();
    HexMaps.HexMapService = HexMapService;
})(HexMaps || (HexMaps = {}));

console.log("Creating the hexMap module");
var hexMapModule = angular.module("hexMap", []).service("cameraService", HexMaps.CameraService).service("hexMapInteractionService", HexMaps.HexMapInteractionService).service("hexTileDefinitions", HexMaps.HexTileDefinitions).service("hexMapService", HexMaps.HexMapService).directive("drawHexMap", HexMaps.DrawHexMapDirective).directive("selectHexMap", HexMaps.SelectHexMapDirective);
hexMapModule.controller("hexMapCtrl", HexMaps.HexMapController);
//# sourceMappingURL=HexMapModule.js.map
