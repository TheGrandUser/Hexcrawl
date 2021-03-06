﻿/// <reference path="../../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../scripts/rx.d.ts" />
/// <reference path="../../scripts/rx.async.d.ts" />
/// <reference path="../../scripts/rx.binding.d.ts" />
/// <reference path="../../scripts/rx.time.d.ts" />
/// <reference path="modeltypes.ts" />
var HexMaps;
(function (HexMaps) {
    'use strict';

    var Game = (function () {
        function Game() {
        }
        return Game;
    })();
    HexMaps.Game = Game;

    var HexMapController = (function () {
        function HexMapController($scope, $http, $routeParams, hexMapService, cameraService, hexTiles, interactionService) {
            this.$scope = $scope;
            console.log("Creating the HexMapController");

            $scope.edgeToEdge = HexMaps.HexagonDefinition.EdgeToEdge;
            $scope.vertexToVertex = HexMaps.HexagonDefinition.VertexToVertex;
            $scope.side = HexMaps.HexagonDefinition.SideLength;
            $scope.flare = HexMaps.HexagonDefinition.Flare;

            $scope.camera = cameraService;
            $scope.interaction = interactionService;

            $scope.tiles = [hexTiles.DefaultHex, hexTiles.RedTile, hexTiles.GreenTile, hexTiles.BlueTile];

            $scope.setIsSelecting = function () {
                interactionService.isSelecting = true;
                interactionService.paintingTile = null;
            };
            $scope.setPaintTile = function (tile) {
                interactionService.isSelecting = false;
                interactionService.paintingTile = tile;
            };

            $http.get("/api/GamesApi/Game/" + $routeParams.gameId).then(function (result) {
                $scope.game = result.data;
            }, function (error) {
                console.log("error getting game info" + error.data);
            });
        }
        HexMapController.$inject = ['$scope', '$http', '$routeParams', 'hexMapService', 'cameraService', 'hexTileDefinitions', 'hexMapInteractionService'];
        return HexMapController;
    })();
    HexMaps.HexMapController = HexMapController;

    var GamesListController = (function () {
        function GamesListController($scope, $http, $location) {
            this.$scope = $scope;
            this.$http = $http;
            this.$location = $location;
            var self = this;

            $scope.createNew = function () {
                return self.createNew();
            };
            $scope.playGame = function (id) {
                return self.playGame(id);
            };
            $scope.editGame = function (id) {
                return self.editGame(id);
            };
            $scope.deleteGame = function (id) {
                return self.deleteGame(id);
            };
            $scope.cancelNewGame = function () {
                return self.cancelNewGame();
            };
            $scope.saveNewGame = function () {
                return self.saveNewGame();
            };

            $scope.games = [];
            $scope.newGame = null;
            $scope.visibilities = [
                "Public",
                "Private",
                "Friends",
                "Unlisted"
            ];

            var self = this;

            this.$http.get("/api/GamesApi/MemberGames").then(function (result) {
                self.$scope.games = result.data;
            }, function (error) {
                console.log("error getting game list" + error.data);
            });
        }
        GamesListController.prototype.createNew = function () {
            this.$scope.newGame = new Game();
        };

        GamesListController.prototype.playGame = function (gameId) {
            this.$location.url("game/" + gameId);
        };

        GamesListController.prototype.editGame = function (gameId) {
        };

        GamesListController.prototype.deleteGame = function (gameId) {
            var game = this.$scope.games.filter(function (g) {
                return g.GameId === gameId;
            })[0];
            var self = this;

            if (confirm("Do you really want to delete " + game.Name + "?")) {
                this.$http.get("/api/GamesApi/Delete").then(function (result) {
                    var index = self.$scope.games.indexOf(game);
                    self.$scope.games.splice(index);
                }, function (error) {
                    console.log("could not delete game: " + error.data);
                });
            }
        };

        GamesListController.prototype.cancelNewGame = function () {
            this.$scope.newGame = null;
        };

        GamesListController.prototype.saveNewGame = function () {
            var _this = this;
            console.log("created a new game!", this.$scope.newGame);

            this.$http.post("/api/GamesApi/Create", { Name: this.$scope.newGame.Name, Visibility: this.$scope.newGame.Visibility }).then(function (result) {
                _this.$scope.games.push(result.data);
            }, function (errorResult) {
                console.log("Could not creat game, error from server", errorResult.data);
            });

            this.$scope.newGame = null;
        };

        GamesListController.$inject = ['$scope', '$http', '$location'];
        return GamesListController;
    })();
    HexMaps.GamesListController = GamesListController;

    function HexMapInteractDirective(hexMapInteractionService, cameraService) {
        console.log("Creating a selectHexMap directive!");
        return {
            restrict: "A",
            link: function (scope, element) {
                console.log("Linking a selectHexMap directive!");

                var ngEventToPoint = function (mouseEvent) {
                    return new HexMaps.Point(mouseEvent.offsetX, mouseEvent.offsetY);
                };
                var eventToPoint = function (mouseEvent) {
                    return new HexMaps.Point(mouseEvent.offsetX, mouseEvent.offsetY);
                };

                var mouseDownObs = Rx.Observable.fromEventPattern(function (handler) {
                    element.bind("mousedown", handler);
                }, function (handler) {
                    element.unbind("mousedown");
                });

                var mouseUpObs = Rx.Observable.fromEvent(document, "mouseup");

                //var mouseUpObs = Rx.Observable.fromEventPattern<JQueryMouseEventObject>(
                //    function (handler: (event: JQueryMouseEventObject) => void) { element.bind("mouseup", handler); },
                //    function (handler: (event: JQueryMouseEventObject) => void) { element.unbind("mouseup"); });
                //var mouseMoveObs = Rx.Observable.fromEvent<MouseEvent>(document, "mousemove");
                var mouseMoveObs = Rx.Observable.fromEventPattern(function (handler) {
                    element.bind("mousemove", handler);
                }, function (handler) {
                    element.unbind("mousemove");
                });

                var mousePointerObs = mouseMoveObs.select(ngEventToPoint).throttle(1 / 15);

                var drag = mouseDownObs.where(function (downEvent) {
                    return downEvent.button === 0;
                }).selectMany(function (downEvent) {
                    return mousePointerObs.startWith(ngEventToPoint(downEvent)).zip(mousePointerObs, function (first, second) {
                        return first.sub(second);
                    }).takeUntil(mouseUpObs);
                });

                drag.subscribe(function (delta) {
                    scope.$apply(function (s) {
                        cameraService.position = cameraService.position.add(delta);
                    });
                    hexMapInteractionService.doRender();
                });

                var selection = mouseDownObs.where(function (downEvent) {
                    return downEvent.button === 0;
                }).selectMany(function (downEvent) {
                    return mouseUpObs.takeUntil(mouseMoveObs.skip(1)).take(1);
                });

                selection.subscribe(function (clickEvent) {
                    scope.$apply(function (s) {
                        hexMapInteractionService.doInteraction(eventToPoint(clickEvent));
                    });
                    hexMapInteractionService.doRender();
                });
            }
        };
    }
    HexMaps.HexMapInteractDirective = HexMapInteractDirective;
    HexMapInteractDirective.$inject = ['hexMapInteractionService', 'cameraService'];

    function HexMapDrawDirective(hexMapInteractionService, cameraService) {
        console.log("Creating a drawHexMap directive!");

        return {
            restrict: "A",
            link: function (scope, element) {
                console.log("Linking a drawHexMap directive!");

                var canvas = element[0];
                var ctx = canvas.getContext('2d');

                var width = canvas.width;
                var height = canvas.height;

                cameraService.width = width;
                cameraService.height = height;

                hexMapInteractionService.renderMap = function (map) {
                    ctx.clearRect(0, 0, width, height);

                    var worldRect = new HexMaps.Rectangle(cameraService.position.X, cameraService.position.Y, cameraService.width, cameraService.height);

                    var hexRect = new HexMaps.HexRectangle(worldRect);
                    hexRect.forEachCoord(function (coord) {
                        var tile = map.hexAt(coord);
                        if (tile) {
                            var point = coord.toPixel().sub(cameraService.position);
                            tile.definition.draw(ctx, coord, point);
                        }
                    });

                    if (hexMapInteractionService.selectedHexCoord && hexRect.isInBounds(hexMapInteractionService.selectedHexCoord)) {
                        var tile = map.hexAt(hexMapInteractionService.selectedHexCoord);
                        if (tile) {
                            var point = hexMapInteractionService.selectedHexCoord.toPixel().sub(cameraService.position);

                            tile.definition.drawSelection(ctx, point);
                        }
                    }
                    //var cameraOffset = cameraService.position.sub(cameraService.debugOffset);
                    //ctx.lineWidth = 1;
                    //ctx.strokeStyle = "cyan";
                    //ctx.strokeRect(cameraOffset.X, cameraOffset.Y, screenRect.width, screenRect.height);
                };

                hexMapInteractionService.startRenderLoop();
            }
        };
    }
    HexMaps.HexMapDrawDirective = HexMapDrawDirective;
    HexMapDrawDirective.$inject = ['hexMapInteractionService', 'cameraService'];

    var HexTileDefinitions = (function () {
        function HexTileDefinitions() {
            this.defaultHex = new HexMaps.HexagonDefinition("LightGray", "Default");
            this.redHex = new HexMaps.HexagonDefinition("Red", "Red");
            this.greenHex = new HexMaps.HexagonDefinition("Green", "Green");
            this.blueHex = new HexMaps.HexagonDefinition("Blue", "Blue");
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

            //this.debugOffset = new Point(-HexMaps.getHexWidth(), -HexMaps.getHexHeight());
            this.width = 800;
            this.height = 600;
            this.position = new HexMaps.Point(0, 0);
        }
        Object.defineProperty(CameraService.prototype, "position", {
            //debugOffset: Point;
            get: function () {
                return this.pos;
            },
            set: function (value) {
                this.pos = value;

                var lowerRight = this.hexMapService.hexMap.getLowerRightCoord();
                var worldPoint = lowerRight.toPixel();

                if (this.pos.X + this.width > worldPoint.X) {
                    this.pos.X = worldPoint.X - this.width;
                } else if (this.pos.X < 0) {
                    this.pos.X = 0;
                }

                if (this.pos.Y + this.height > worldPoint.Y) {
                    this.pos.Y = worldPoint.Y - this.height;
                } else if (this.pos.Y < 0) {
                    this.pos.Y = 0;
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
            this.selectedHexCoord = null;
            this.isRenderingStarted = false;
            this.hexMapService = hexMapService;
            this.cameraService = cameraService;

            this.isSelecting = true;
            this.paintingTile = null;

            this.clickStatus = document.getElementById("debugInfo");
        }
        HexMapInteractionService.prototype.doInteraction = function (point) {
            var worldPoint = point.add(this.cameraService.position);
            var coord = HexMaps.AxialCoord.fromPoint(worldPoint);

            if (this.isSelecting === true) {
                console.log("A selection was made at " + point.X + ", " + point.Y);
                console.log("      World location at " + worldPoint.X + ", " + worldPoint.Y);

                if (this.selectedHexCoord) {
                    this.selectedHexCoord = null;
                }

                console.log("selected coord: q " + coord.q + ", r " + coord.r);

                var hex = this.hexMapService.hexMap.hexAt(coord);

                if (hex) {
                    this.selectedHexCoord = coord;
                    this.clickStatus.innerHTML = "Selected hex: " + coord + "<br />Mouse x: " + worldPoint.X + "<br />Mouse y: " + worldPoint.Y + "<br />Coord q " + coord.q + ", r " + coord.r;
                    console.log("selected hex " + coord);
                } else {
                    this.clickStatus.innerHTML = "No hex selected<br />Mouse x: " + worldPoint.X + "<br />Mouse y: " + worldPoint.Y + "<br />Coord q " + coord.q + ", r " + coord.r;
                    console.log("no hex selected");
                }
            } else if (this.paintingTile !== null) {
                this.hexMapService.hexMap.setHex(coord, this.paintingTile);
            }
            //if (this.isRenderingStarted) {
            //    this.renderMap(this.hexMapService.hexMap);
            //}
        };

        HexMapInteractionService.prototype.doRender = function () {
            if (this.isRenderingStarted) {
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

            this.hexMap = new HexMaps.HexTileMap(80, 40, hexTileDefinitions.DefaultHex);

            this.hexMap.setHex(new HexMaps.AxialCoord(2, 1), hexTileDefinitions.GreenTile);
        }
        return HexMapService;
    })();
    HexMaps.HexMapService = HexMapService;
})(HexMaps || (HexMaps = {}));

console.log("Creating the hexMap module");
var hexMapModule = angular.module("hexMap", []).service("cameraService", HexMaps.CameraService).service("hexMapInteractionService", HexMaps.HexMapInteractionService).service("hexTileDefinitions", HexMaps.HexTileDefinitions).service("hexMapService", HexMaps.HexMapService).directive("hxDraw", HexMaps.HexMapDrawDirective).directive("hxInteract", HexMaps.HexMapInteractDirective);

hexMapModule.controller("gamesListCtrl", HexMaps.GamesListController).controller("hexMapCtrl", HexMaps.HexMapController);
//# sourceMappingURL=HexMapModule.js.map
