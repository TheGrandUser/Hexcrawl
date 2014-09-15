var HexCrawl;
(function (HexCrawl) {
    'use strict';

    console.log("Creating the hexCrawl module");

    var app = angular.module("hexCrawl", ['ngRoute', 'hexMap']);

    app.config([
        '$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: "App/Partials/HexMapView.html",
                controller: "hexMapCtrl"
            }).otherwise({
                redirectTo: '/'
            });
        }]);
})(HexCrawl || (HexCrawl = {}));
//# sourceMappingURL=app.js.map
