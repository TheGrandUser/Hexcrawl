
module HexCrawl {

    'use strict';

    console.log("Creating the hexCrawl module");

    var app = angular.module("hexCrawl", ['ngRoute', 'hexMap']);

    app.config(['$routeProvider', function ($routeProvider: ng.route.IRouteProvider) {
        console.log("Configuring the hexCrawl module");
        $routeProvider
            .when('/home', {
                templateUrl: "/App/Partials/HexMapView.html",
                controller: "hexMapCtrl"
            })
            .otherwise({
                redirectTo: '/home'
            });
    }]);
}