/// <reference path="../../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../scripts/rx.d.ts" />
/// <reference path="../../scripts/rx.async.d.ts" />
/// <reference path="../../scripts/rx.binding.d.ts" />
/// <reference path="../../scripts/rx.time.d.ts" />

module HexMaps {

    'use strict';

    export class Game {
        Name: string;
        Visibility: string;
        GameId: number;
    }

    export function HexMapInteractDirective(
        hexMapInteractionService: IHexMapInteractionService,
        cameraService: ICameraService): ng.IDirective {
        console.log("Creating a selectHexMap directive!");
        return {
            restrict: "A",
            link: function (scope, element) {

                console.log("Linking a selectHexMap directive!");

                var ngEventToPoint = (mouseEvent: JQueryMouseEventObject) => new Point(mouseEvent.offsetX, mouseEvent.offsetY);
                var eventToPoint = (mouseEvent: MouseEvent) => new Point(mouseEvent.offsetX, mouseEvent.offsetY);

                var mouseDownObs = Rx.Observable.fromEventPattern<JQueryMouseEventObject>(
                    function (handler: (event: JQueryMouseEventObject) => void) { element.bind("mousedown", handler); },
                    function (handler: (event: JQueryMouseEventObject) => void) { element.unbind("mousedown"); });

                var mouseUpObs = Rx.Observable.fromEvent<MouseEvent>(document, "mouseup");
                //var mouseUpObs = Rx.Observable.fromEventPattern<JQueryMouseEventObject>(
                //    function (handler: (event: JQueryMouseEventObject) => void) { element.bind("mouseup", handler); },
                //    function (handler: (event: JQueryMouseEventObject) => void) { element.unbind("mouseup"); });

                //var mouseMoveObs = Rx.Observable.fromEvent<MouseEvent>(document, "mousemove");
                var mouseMoveObs = Rx.Observable.fromEventPattern<JQueryMouseEventObject>(
                    function (handler: (event: JQueryMouseEventObject) => void) { element.bind("mousemove", handler); },
                    function (handler: (event: JQueryMouseEventObject) => void) { element.unbind("mousemove"); });

                var mousePointerObs = mouseMoveObs.select(ngEventToPoint).throttle(1 / 15);

                var drag = mouseDownObs
                    .where(downEvent => downEvent.button === 0)
                    .selectMany(downEvent => mousePointerObs
                        .startWith(ngEventToPoint(downEvent))
                        .zip(mousePointerObs, (first, second) => first.sub(second))
                        .takeUntil(mouseUpObs));

                drag.subscribe(delta => {
                    scope.$apply((s: ng.IScope) => {
                        cameraService.position = cameraService.position.add(delta);
                    });
                    hexMapInteractionService.doRender();
                });

                var selection = mouseDownObs
                    .where(downEvent => downEvent.button === 0)
                    .selectMany(downEvent => mouseUpObs.takeUntil(mouseMoveObs.skip(1)).take(1));

                selection.subscribe(clickEvent => {
                    scope.$apply((s: ng.IScope) => {
                        hexMapInteractionService.doInteraction(eventToPoint(clickEvent));
                    });
                    hexMapInteractionService.doRender();
                });
            }
        };
    }
    HexMapInteractDirective.$inject = ['hexMapInteractionService', 'cameraService'];

    export function HexMapDrawDirective(
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

                    ctx.clearRect(0, 0, width, height);

                    var worldRect = new Rectangle(cameraService.position.X, cameraService.position.Y, cameraService.width, cameraService.height);

                    var hexRect = new HexRectangle(worldRect);
                    hexRect.forEachCoord(function (coord: AxialCoord) {
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
                }

                hexMapInteractionService.startRenderLoop();
            }
        };
    }
    HexMapDrawDirective.$inject = ['hexMapInteractionService', 'cameraService'];
}

console.log("Creating the hexMap module");
var hexMapModule = angular.module("hexMap", [])
    .service("cameraService", HexMaps.CameraService)
    .service("hexMapInteractionService", HexMaps.HexMapInteractionService)
    .service("hexTileDefinitions", HexMaps.HexTileDefinitions)
    .service("hexMapService", HexMaps.HexMapService)
    .directive("hxDraw", HexMaps.HexMapDrawDirective)
    .directive("hxInteract", HexMaps.HexMapInteractDirective);

hexMapModule
    .controller("gamesListCtrl", HexMaps.GamesListController)
    .controller("hexMapCtrl", HexMaps.HexMapController)
;