/// <reference path="../../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../scripts/rx.d.ts" />
/// <reference path="../../scripts/rx.async.d.ts" />
/// <reference path="../../scripts/rx.binding.d.ts" />
/// <reference path="../../scripts/rx.time.d.ts" />
/// <reference path="modeltypes.ts" />

module HexMaps {

    'use strict';


    export interface HexMapScope extends ng.IScope {
        edgeToEdge: number;
        vertexToVertex: number;
        side: number;
        flare: number;

        game: Game;

        camera: ICameraService;

        tiles: HexagonDefinition[];

        interaction: IHexMapInteractionService;

        setIsSelecting(): void;
        setPaintTile(tile: HexagonDefinition): void;
    }

    export interface HexMapParameters extends ng.route.IRouteParamsService {
        gameId: number;
    }

    export class HexMapController {
        constructor(
            private $scope: HexMapScope,
            $http: ng.IHttpService,
            $routeParams: HexMapParameters,
            hexMapService: IHexMapService,
            cameraService: ICameraService,
            hexTiles: IHexTileDefinitions,
            interactionService: IHexMapInteractionService) {

            console.log("Creating the HexMapController");

            $scope.edgeToEdge = HexMaps.HexagonDefinition.EdgeToEdge;
            $scope.vertexToVertex = HexMaps.HexagonDefinition.VertexToVertex;
            $scope.side = HexMaps.HexagonDefinition.SideLength;
            $scope.flare = HexMaps.HexagonDefinition.Flare;

            $scope.camera = cameraService;
            $scope.interaction = interactionService;

            $scope.tiles = [hexTiles.DefaultHex, hexTiles.RedTile, hexTiles.GreenTile, hexTiles.BlueTile];

            $scope.setIsSelecting = () => { interactionService.isSelecting = true; interactionService.paintingTile = null; };
            $scope.setPaintTile = tile => { interactionService.isSelecting = false; interactionService.paintingTile = tile; };

            $http.get("/api/GamesApi/Game/" + $routeParams.gameId).then(
                (result: ng.IHttpPromiseCallbackArg<Game>) => {
                    $scope.game = result.data;
                },
                (error: ng.IHttpPromiseCallbackArg<any>) => {
                    console.log("error getting game info" + error.data);
                });
        }

        public static $inject = ['$scope', '$http', '$routeParams', 'hexMapService', 'cameraService', 'hexTileDefinitions', 'hexMapInteractionService'];
    }

    export interface GamesListScope extends ng.IScope {
        createNew();
        playGame(gameId: number): void;
        editGame(gameId: number): void;
        deleteGame(gameId: number): void;
        cancelNewGame(): void;
        saveNewGame(): void;

        games: Game[];

        newGame: Game;
        visibilities: string[];
    }

    export class GamesListController {
        constructor(
            private $scope: GamesListScope,
            private $http: ng.IHttpService,
            private $location: ng.ILocationService) {
            var self = this;

            $scope.createNew = () => self.createNew();
            $scope.playGame = id => self.playGame(id);
            $scope.editGame = id => self.editGame(id);
            $scope.deleteGame = id => self.deleteGame(id);
            $scope.cancelNewGame = () => self.cancelNewGame();
            $scope.saveNewGame = () => self.saveNewGame();

            $scope.games = [];
            $scope.newGame = null;
            $scope.visibilities =
            [
                "Public",
                "Private",
                "Friends",
                "Unlisted"
            ];

            var self = this;

            this.$http.get("/api/GamesApi/MemberGames")
                .then((result: ng.IHttpPromiseCallbackArg<Game[]>) => {
                    self.$scope.games = result.data;
                },
                (error: ng.IHttpPromiseCallbackArg<any>) => {
                    console.log("error getting game list" + error.data);
                });
        }

        createNew(): void {
            this.$scope.newGame = new Game();
        }

        playGame(gameId: number): void {
            this.$location.url("game/" + gameId);
        }

        editGame(gameId: number): void {

        }

        deleteGame(gameId: number): void {

            var game = this.$scope.games.filter(g => g.GameId === gameId)[0];
            var self = this;

            if (confirm("Do you really want to delete " + game.Name + "?")) {
                this.$http.get("/api/GamesApi/Delete")
                    .then(
                    result => {
                        var index = self.$scope.games.indexOf(game);
                        self.$scope.games.splice(index);
                    },
                    (error: ng.IHttpPromiseCallbackArg<any>) => {
                        console.log("could not delete game: " + error.data);
                    });
            }
        }

        cancelNewGame(): void {
            this.$scope.newGame = null;
        }

        saveNewGame(): void {
            console.log("created a new game!", this.$scope.newGame);

            this.$http.post("/api/GamesApi/Create", { Name: this.$scope.newGame.Name, Visibility: this.$scope.newGame.Visibility })
                .then(
                (result: ng.IHttpPromiseCallbackArg<Game>) => {
                    this.$scope.games.push(result.data)
                },
                errorResult => {
                    console.log("Could not creat game, error from server", errorResult.data);
                });

            this.$scope.newGame = null;
        }

        public static $inject = ['$scope', '$http', '$location'];
    }

}