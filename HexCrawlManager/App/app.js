var HexCrawl;
(function (HexCrawl) {
    'use strict';

    console.log("Creating the hexCrawl module");

    var app = angular.module("hexCrawl", ['ngRoute', 'hexMap']);

    app.config([
        '$routeProvider', function ($routeProvider) {
            console.log("Configuring the hexCrawl module");
            $routeProvider.when('/home', {
                templateUrl: "/App/Partials/HexMapView.html",
                controller: "hexMapCtrl"
            }).otherwise({
                redirectTo: '/home'
            });
        }]);
})(HexCrawl || (HexCrawl = {}));
//# sourceMappingURL=app.js.map
