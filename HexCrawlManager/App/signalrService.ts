/// <reference path="../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../scripts/rx.d.ts" />
/// <reference path="../scripts/rx.async.d.ts" />
/// <reference path="../scripts/rx.binding.d.ts" />
/// <reference path="../scripts/rx.time.d.ts" />
/// <reference path="./HexMaps/modeltypes.ts" />

interface IHexMapClient {
    tileHasChanged(mapId: number, coord: HexMaps.AxialCoord, tileDefinition: number): any;

    hexMapCreated(mapId: number): void;
    HexMapRemoved(mapId: number): void;
}

interface IHexMapServer {
    setTile(mapId: number, coord: HexMaps.AxialCoord, tileDefinition: number): any;

    joinGameGroup(gameId: number): any;
    leaveGameGroup(gameId: number): any;
}

interface HubProxy {
    client: IHexMapClient;
    server: IHexMapServer;

}

interface SignalR {
    hexMapHub: HubProxy;
}

class TileChangedArgs {
    constructor(
        public hexMapId: number,
        public coord: HexMaps.AxialCoord,
        public definition: number) {
    }


}

module HexCrawl {

    export interface ISignalrService {
        tileChanged: Rx.Observable<TileChangedArgs>;

        singleRPromise: ng.IPromise<HubProxy>;

        setTile(mapId: number, coord: HexMaps.AxialCoord, definition: number);
        joinGameGroup(gameId: number);
        leaveGameGroup(gameId: number);
    }

    class signalrService {

        private hexMap: HubProxy;
        private scope: ng.IScope;

        private _tileChanged: Rx.Subject<TileChangedArgs>;

        static $inject = ["$q"];

        initializePromise: ng.IPromise<HubProxy>;

        constructor(private $q :ng.IQService) {
            this.hexMap = $.connection.hexMapHub;

            this.initializePromise = this.$q.when($.connection.hub.start()).then(result => {
                return this.hexMap;
            });
        }

        get tileChanged(): Rx.Observable<TileChangedArgs> {
            return this.tileChanged.asObservable();
        }

        get singleRPromise(): ng.IPromise<HubProxy> {
            return this.initializePromise;
        }

        initialize(): ng.IPromise<any> {
            var that = this;
            
            return this.$q.when($.connection.hub.start().done(() => {

                that.hexMap.client.tileHasChanged = (id, coord, def) =>
                    that._tileChanged.onNext(new TileChangedArgs(id, coord, def));

                this.setTile = (mapId: number, coord: HexMaps.AxialCoord, definition: number) => {
                    this.hexMap.server.setTile(mapId, coord, definition);
                };

                this.joinGameGroup = (gameId: number) => {
                    this.hexMap.server.joinGameGroup(gameId);
                };

                this.leaveGameGroup = (gameId: number) => {
                    this.hexMap.server.leaveGameGroup(gameId);
                };
            }));
        }

        setTile(mapId: number, coord: HexMaps.AxialCoord, definition: number) {
            console.log("");
        }

        joinGameGroup(gameId: number) {
        }
        leaveGameGroup(gameId: number) {
        }
    }


    var srMod = angular.module("signalrHex");
    srMod.service(signalrService);
}