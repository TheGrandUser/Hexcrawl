/// <reference path="../../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../scripts/typings/rx/rx.d.ts" />
/// <reference path="../../scripts/typings/rx/rx.async.d.ts" />
/// <reference path="../../scripts/typings/rx/rx.binding.d.ts" />
/// <reference path="../../scripts/typings/rx/rx.time.d.ts" />
/// <reference path="modeltypes.ts" />

module HexMaps {

    'use strict';

    export interface IHexTileDefinitions {

        DefaultHex: HexagonDefinition;
        RedTile: HexagonDefinition;
        GreenTile: HexagonDefinition;
        BlueTile: HexagonDefinition;

        Hexes: Map<string, HexagonDefinition>;
    }

    export interface ICameraService {
        //debugOffset: Point;

        position: Point;
        width: number;
        height: number;
    }

    export interface IHexMapInteractionService {

        selectedHex: HexTile;

        makeSelection(point: Point);

        doRender();
        renderMap(map: HexTileMap);

        startRenderLoop();
    }

    export interface IHexMapService {
        hexMap: HexTileMap;
    }

    export interface HaxMapScope extends ng.IScope {
        edgeToEdge: number;
        vertexToVertex: number;
        side: number;

        camera: ICameraService;
    }

    export class HexMapController {
        constructor(private $scope: HaxMapScope, hexMapService: IHexMapService, cameraService: ICameraService) {

            $scope.edgeToEdge = HexMaps.HexagonDefinition.EdgeToEdge;
            $scope.vertexToVertex = HexMaps.HexagonDefinition.VertexToVertex;
            $scope.side = HexMaps.HexagonDefinition.SideLength;

            $scope.camera = cameraService;
        }

        static $inject = ['$scope', 'hexMapService', 'cameraService'];
    }

    class DragEvent {
        constructor(public start: Point, public end: Point) {
        }
    }

    export function SelectHexMapDirective(
        hexMapInteractionService: IHexMapInteractionService,
        cameraService: ICameraService): ng.IDirective {
        console.log("Creating a selectHexMap directive!");
        return {
            restrict: "A",
            link: function (scope, element) {

                console.log("Linking a selectHexMap directive!");

                var eventToPoint = (mouseEvent: JQueryMouseEventObject) => new Point(mouseEvent.offsetX, mouseEvent.offsetY);
                
                var mouseDownObs = Rx.Observable.fromEventPattern<JQueryMouseEventObject>(
                    function (handler: (event: JQueryMouseEventObject) => void) { element.bind("mousedown", handler); },
                    function (handler: (event: JQueryMouseEventObject) => void) { element.unbind("mousedown"); });

                var mouseUpObs = Rx.Observable.fromEventPattern<JQueryMouseEventObject>(
                    function (handler: (event: JQueryMouseEventObject) => void) { element.bind("mouseup", handler); },
                    function (handler: (event: JQueryMouseEventObject) => void) { element.unbind("mouseup"); });

                var mouseMoveObs = Rx.Observable.fromEventPattern<JQueryMouseEventObject>(
                    function (handler: (event: JQueryMouseEventObject) => void) { element.bind("mousemove", handler); },
                    function (handler: (event: JQueryMouseEventObject) => void) { element.unbind("mousemove"); });

                var mousePointerObs = mouseMoveObs.select(eventToPoint).throttle(1/15);

                var drag = mouseDownObs
                    .where(downEvent => downEvent.button === 0)
                    .selectMany(downEvent => mousePointerObs
                        .startWith(eventToPoint(downEvent))
                        .zip(mousePointerObs, (first, second) => first.sub(second))
                        .takeUntil(mouseUpObs));

                drag.subscribe(delta => {
                    cameraService.position = cameraService.position.add(delta);
                    hexMapInteractionService.doRender();
                });

                var selection = mouseDownObs
                    .where(downEvent => downEvent.button === 0)
                    .selectMany(downEvent => mouseUpObs.takeUntil(mouseMoveObs).take(1));

                selection.subscribe(clickEvent => {
                    hexMapInteractionService.makeSelection(eventToPoint(clickEvent));
                });
            }
        };
    }
    SelectHexMapDirective.$inject = ['hexMapInteractionService', 'cameraService'];

    export function DrawHexMapDirective(
        hexMapInteractionService: IHexMapInteractionService,
        cameraService: ICameraService): ng.IDirective {
        console.log("Creating a drawHexMap directive!");

        return {
            restrict: "A",
            link: function (scope, element) {
                console.log("Linking a drawHexMap directive!");

                var canvas = <HTMLCanvasElement>element[0];
                var ctx = canvas.getContext('2d');

                var width = canvas.width;
                var height = canvas.height;

                cameraService.width = width;
                cameraService.height = height;

                hexMapInteractionService.renderMap = function (map: HexTileMap) {

                    console.log("drawing hexes");
                    ctx.clearRect(0, 0, width, height);

                    var worldRect = new Rectangle(cameraService.position.X, cameraService.position.Y, cameraService.width, cameraService.height);
                    
                    var hexRect = new HexRectangle(worldRect);
                    hexRect.forEachCoord(function (coord: AxialCoord) {
                        var tile = map.hexAt(coord);
                        if (tile) {
                            tile.draw(ctx, cameraService.position, hexRect.isInBounds(tile.coord));
                        }
                    });

                    if (hexMapInteractionService.selectedHex && hexRect.isInBounds(hexMapInteractionService.selectedHex.coord)) {
                        hexMapInteractionService.selectedHex.drawSelection(ctx, cameraService.position);
                    }

                    //var cameraOffset = cameraService.position.sub(cameraService.debugOffset);

                    //ctx.lineWidth = 1;
                    //ctx.strokeStyle = "cyan";
                    //ctx.strokeRect(cameraOffset.X, cameraOffset.Y, screenRect.width, screenRect.height);
                }

                hexMapInteractionService.startRenderLoop();
            }
        };
    }
    DrawHexMapDirective.$inject = ['hexMapInteractionService', 'cameraService'];

    export class HexTileDefinitions implements IHexTileDefinitions {

        defaultHex: HexagonDefinition = new HexagonDefinition("LightGray");
        redHex: HexagonDefinition = new HexagonDefinition("Red");
        greenHex: HexagonDefinition = new HexagonDefinition("Green");
        blueHex: HexagonDefinition = new HexagonDefinition("Blue");

        hexes: Map<string, HexagonDefinition> = new Map<string, HexagonDefinition>();

        get DefaultHex(): HexagonDefinition { return this.defaultHex; }
        get RedTile(): HexagonDefinition { return this.redHex; }
        get GreenTile(): HexagonDefinition { return this.greenHex; }
        get BlueTile(): HexagonDefinition { return this.blueHex; }

        get Hexes(): Map<string, HexagonDefinition> { return this.hexes; }

        constructor() {

            this.hexes.set("Default", this.defaultHex);
            this.hexes.set("Red", this.redHex);
            this.hexes.set("Green", this.greenHex);
            this.hexes.set("Blue", this.blueHex);
        }
    }

    export class CameraService implements ICameraService {

        hexMapService: IHexMapService;

        pos: Point = new Point(0, 0);

        //debugOffset: Point;

        get position(): Point { return this.pos; }
        set position(value: Point) {
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
        }
        width: number;
        height: number;

        rightLimit: number;
        bottomLimit: number;

        constructor(hexMapService: IHexMapService) {
            console.log("Creating cameraService");
            this.hexMapService = hexMapService;

            //this.debugOffset = new Point(-HexMaps.getHexWidth(), -HexMaps.getHexHeight());
            this.width = 800;
            this.height = 600;
            this.position = new Point(0, 0)
        }
    }

    export class HexMapInteractionService implements IHexMapInteractionService {

        selectedHex: HexTile = null;

        isRenderingStarted: boolean = false;

        clickStatus: HTMLDivElement;

        private hexMapService: IHexMapService;
        private cameraService: ICameraService;

        constructor(hexMapService: IHexMapService, cameraService: ICameraService) {

            this.hexMapService = hexMapService;
            this.cameraService = cameraService;

            this.clickStatus = <HTMLDivElement>document.getElementById("debugInfo");
        }

        makeSelection(point: Point) {
            console.log("A selection was made at " + point.X + ", " + point.Y);
            var worldPoint = point.add(this.cameraService.position);
            console.log("      World location at " + worldPoint.X + ", " + worldPoint.Y);

            if (this.selectedHex) {
                this.selectedHex = null;
            }

            var coord = AxialCoord.fromPoint(worldPoint);
            console.log("selected coord: q " + coord.q + ", r " + coord.r);

            var hex = this.hexMapService.hexMap.hexAt(coord);

            if (hex) {
                this.selectedHex = hex;
                this.clickStatus.innerHTML = "Selected hex: " + coord + "<br />Mouse x: " + worldPoint.X + "<br />Mouse y: " + worldPoint.Y +
                "<br />Coord q " + coord.q + ", r " + coord.r;
                console.log("selected hex " + coord);
            }
            else {
                this.clickStatus.innerHTML = "No hex selected<br />Mouse x: " + worldPoint.X + "<br />Mouse y: " + worldPoint.Y +
                "<br />Coord q " + coord.q + ", r " + coord.r;
                console.log("no hex selected");
            }

            if (this.isRenderingStarted) {
                this.renderMap(this.hexMapService.hexMap);
            }
        }

        doRender() {
            if (this.renderMap) {
                this.renderMap(this.hexMapService.hexMap);
            }
        }

        renderMap(map: HexTileMap) { }

        startRenderLoop() {
            this.isRenderingStarted = true;
            this.renderMap(this.hexMapService.hexMap);
        }
    }

    export class HexMapService implements IHexMapService {
        //grid: Grid;
        hexMap: HexTileMap = null;

        constructor(hexTileDefinitions: IHexTileDefinitions) {

            var height = 60;

            HexMaps.HexagonDefinition.SetupHexStatics(height);

            this.hexMap = new HexTileMap(80, 40, hexTileDefinitions.DefaultHex);

            this.hexMap.setHex(new AxialCoord(2, 1), hexTileDefinitions.GreenTile);
        }
    }
}

console.log("Creating the hexMap module");
var hexMapModule = angular.module("hexMap", [])
    .service("cameraService", HexMaps.CameraService)
    .service("hexMapInteractionService", HexMaps.HexMapInteractionService)
    .service("hexTileDefinitions", HexMaps.HexTileDefinitions)
    .service("hexMapService", HexMaps.HexMapService)
    .directive("drawHexMap", HexMaps.DrawHexMapDirective)
    .directive("selectHexMap", HexMaps.SelectHexMapDirective);
hexMapModule.controller("hexMapCtrl", HexMaps.HexMapController);