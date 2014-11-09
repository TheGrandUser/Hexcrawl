/// <reference path="../../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../scripts/rx.d.ts" />
/// <reference path="../../scripts/rx.async.d.ts" />
/// <reference path="../../scripts/rx.binding.d.ts" />
/// <reference path="../../scripts/rx.time.d.ts" />
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

        selectedHexCoord: AxialCoord;

        doInteraction(point: Point);

        doRender();
        renderMap(map: HexTileMap);

        startRenderLoop();

        isSelecting: boolean;

        paintingTile: HexagonDefinition;
    }

    export interface IHexMapService {
        hexMap: HexTileMap;
    }

    export class HexTileDefinitions implements IHexTileDefinitions {

        defaultHex: HexagonDefinition = new HexagonDefinition("LightGray", "Default");
        redHex: HexagonDefinition = new HexagonDefinition("Red", "Red");
        greenHex: HexagonDefinition = new HexagonDefinition("Green", "Green");
        blueHex: HexagonDefinition = new HexagonDefinition("Blue", "Blue");

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

        selectedHexCoord: AxialCoord = null;

        isRenderingStarted: boolean = false;

        clickStatus: HTMLDivElement;

        isSelecting: boolean;

        paintingTile: HexagonDefinition;

        private hexMapService: IHexMapService;
        private cameraService: ICameraService;

        constructor(hexMapService: IHexMapService, cameraService: ICameraService) {

            this.hexMapService = hexMapService;
            this.cameraService = cameraService;

            this.isSelecting = true;
            this.paintingTile = null;

            this.clickStatus = <HTMLDivElement>document.getElementById("debugInfo");
        }

        doInteraction(point: Point) {
            var worldPoint = point.add(this.cameraService.position);
            var coord = AxialCoord.fromPoint(worldPoint);

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
                    this.clickStatus.innerHTML = "Selected hex: " + coord + "<br />Mouse x: " + worldPoint.X + "<br />Mouse y: " + worldPoint.Y +
                    "<br />Coord q " + coord.q + ", r " + coord.r;
                    console.log("selected hex " + coord);
                }
                else {
                    this.clickStatus.innerHTML = "No hex selected<br />Mouse x: " + worldPoint.X + "<br />Mouse y: " + worldPoint.Y +
                    "<br />Coord q " + coord.q + ", r " + coord.r;
                    console.log("no hex selected");
                }
            } else if (this.paintingTile !== null) {

                this.hexMapService.hexMap.setHex(coord, this.paintingTile);

            }

            //if (this.isRenderingStarted) {
            //    this.renderMap(this.hexMapService.hexMap);
            //}
        }

        doRender() {
            if (this.isRenderingStarted) {
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