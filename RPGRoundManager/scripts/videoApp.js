///<reference path="../scripts/typings/angularjs/angular.d.ts" />
///<reference path="../scripts/typings/angularjs/angular-route.d.ts" />
var OneStopTechVidsApp;
(function (OneStopTechVidsApp) {
    var app = angular.module("techVidsApp", ['ngRoute']);

    var Config = (function () {
        function Config($routeProvider) {
            $routeProvider.when("/list", {
                templateUrl: "App/Templates/VideoList.html",
                controller: "TechVidsListCtrl"
            }).when("/list/:id", {
                templateUrl: "App/Templates/VideoList.html",
                controller: "TechVidsListCtrl"
            }).when("/add", {
                templateUrl: "App/Templates/AddVideo.html",
                controller: "AddTechVideoCtrl"
            }).when("/edit/:id", {
                templateUrl: "App/Templates/EditVideo.html",
                controller: "EditTechVideoCtrl"
            }).otherwise({
                redirectTo: '/list'
            });
        }
        return Config;
    })();
    OneStopTechVidsApp.Config = Config;

    Config.$inject = ['$routeProvider'];
    app.config(Config);

    var TechVidsDataSvc = (function () {
        function TechVidsDataSvc($http, $q) {
            this.techVidsApiPath = "api/techVideos";
            this.categoriesApiPath = "api/categories";

            this.httpService = $http;
            this.qService = $q;
        }
        TechVidsDataSvc.TechVidsDataSvcFactory = function ($http, $q) {
            return new TechVidsDataSvc($http, $q);
        };

        TechVidsDataSvc.prototype.getAllVideos = function (fetchFromService) {
            var self = this;

            if (fetchFromService) {
                return getVideosFromService();
            } else {
                if (self.videos !== undefined) {
                    return self.qService.when(self.videos);
                } else {
                    return getVideosFromService();
                }
            }

            function getVideosFromService() {
                var deferred = self.qService.defer();

                self.httpService.get(self.techVidsApiPath).then(function (result) {
                    self.videos = result.data;
                    deferred.resolve(self.videos);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        };

        TechVidsDataSvc.prototype.addVideo = function (video) {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.post(self.techVidsApiPath, video).then(function (result) {
                video.id = result.data.id;
                self.videos.push(video);
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };
        return TechVidsDataSvc;
    })();
    OneStopTechVidsApp.TechVidsDataSvc = TechVidsDataSvc;
})(OneStopTechVidsApp || (OneStopTechVidsApp = {}));
//# sourceMappingURL=videoApp.js.map
