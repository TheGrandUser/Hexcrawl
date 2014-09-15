///<reference path="../scripts/typings/angularjs/angular.d.ts" />
///<reference path="../scripts/typings/angularjs/angular-route.d.ts" />
var Extensions;
(function (Extensions) {
    var Video = (function () {
        function Video() {
        }
        return Video;
    })();
    Extensions.Video = Video;

    var Category = (function () {
        function Category() {
        }
        return Category;
    })();
    Extensions.Category = Category;
})(Extensions || (Extensions = {}));

var OneStopTechVidsApp;
(function (OneStopTechVidsApp) {
    var Config = (function () {
        function Config($routeProvider) {
            $routeProvider.when("/list", { templateUrl: "App/Templates/VideoList.html", controller: "TechVidsListCtrl" }).when("/list/:id", { templateUrl: "App/Templates/VideoList.html", controller: "TechVidsListCtrl" }).when("/add", { templateUrl: "App/Templates/AddVideo.html", controller: "AddTechVideoCtrl" }).when("/edit/:id", { templateUrl: "App/Templates/EditVideo.html", controller: "EditTechVideoCtrl" }).otherwise({ redirectTo: '/list' });
        }
        return Config;
    })();
    OneStopTechVidsApp.Config = Config;

    Config.$inject = ['$routeProvider'];

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

        TechVidsDataSvc.prototype.checkIfVideoExists = function (title) {
            var self = this;

            var deferred = self.qService.defer();

            self.httpService.get(self.techVidsApiPath + "?title=" + title).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        TechVidsDataSvc.prototype.getVideosByCategory = function (id) {
            var self = this;

            var filteredVideos = [];

            if (self.videos !== undefined) {
                return self.qService.when(filterVideos());
            } else {
                var deferred = self.qService.defer();
                self.getAllVideos().then(function (data) {
                    deferred.resolve(filterVideos());
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            function filterVideos() {
                for (var counter = 0; counter < self.videos.length; counter++) {
                    if (self.videos[counter].category === id) {
                        filteredVideos.push(self.videos[counter]);
                    }
                }

                return filteredVideos;
            }
        };

        TechVidsDataSvc.prototype.getVideo = function (id) {
            var self = this;

            if (self.videos !== undefined) {
                return self.qService.when(filterVideo());
            } else {
                var deferred = self.qService.defer();

                self.getAllVideos().then(function (data) {
                    deferred.resolve(filterVideo());
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            function filterVideo() {
                for (var counter = 0; counter < self.videos.length; counter++) {
                    if (id === self.videos[counter].id) {
                        return self.videos[counter];
                    }
                }

                return null;
            }
        };

        TechVidsDataSvc.prototype.getAllCategories = function () {
            var self = this;

            if (self.categories !== undefined) {
                return self.qService.when(this.categories);
            } else {
                var deferred = self.qService.defer();

                self.httpService.get(self.categoriesApiPath).then(function (result) {
                    self.categories = result.data;
                    deferred.resolve(self.categories);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        };

        TechVidsDataSvc.prototype.getCategory = function (id) {
            var self = this;

            if (self.categories !== undefined) {
                return self.qService.when(filterCategory());
            } else {
                var deferred = self.qService.defer();

                self.getAllCategories().then(function (data) {
                    deferred.resolve(filterCategory());
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            function filterCategory() {
                for (var counter = 0; counter < self.categories.length; counter++) {
                    if (self.categories[counter].id === id) {
                        return self.categories[counter];
                    }
                }
                return null;
            }
        };

        TechVidsDataSvc.prototype.updateVideo = function (video) {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.put(self.techVidsApiPath + "/" + video.id, video).then(function (data) {
                for (var counter = 0; counter < self.videos.length; counter++) {
                    if (self.videos[counter].id === video.id) {
                        self.videos[counter] = video;
                        break;
                    }
                }
                deferred.resolve();
            }, function (error) {
                deferred.reject();
            });

            return deferred.promise;
        };

        TechVidsDataSvc.prototype.deleteVideo = function (id) {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.delete(self.techVidsApiPath + "/" + id).then(function (result) {
                for (var counter = 0; counter < self.videos.length; counter++) {
                    if (self.videos[counter].id === id) {
                        self.videos.splice(counter, 1);
                        break;
                    }
                }
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        TechVidsDataSvc.prototype.setRating = function (id, rating) {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService({
                method: "patch",
                url: self.techVidsApiPath + "/" + id,
                data: { id: id, rating: rating }
            }).then(function (result) {
                for (var counter = 0; counter < self.videos.length; counter++) {
                    if (self.videos[counter].id === id) {
                        self.videos[counter].rating = rating;
                        break;
                    }
                }
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };
        return TechVidsDataSvc;
    })();
    OneStopTechVidsApp.TechVidsDataSvc = TechVidsDataSvc;

    var TechVidsCategoryCtrl = (function () {
        function TechVidsCategoryCtrl($scope, techVidsDataSvc) {
            this.$scope = $scope;
            this.dataSvc = techVidsDataSvc;

            this.init();
        }
        TechVidsCategoryCtrl.prototype.init = function () {
            var self = this;

            self.dataSvc.getAllCategories().then(function (data) {
                self.$scope.categories = data;
            });
        };
        return TechVidsCategoryCtrl;
    })();
    OneStopTechVidsApp.TechVidsCategoryCtrl = TechVidsCategoryCtrl;
    TechVidsCategoryCtrl.$inject = ['$scope', 'techVidsDataSvc'];

    var app = angular.module("techVidsApp", ['ngRoute']);
    app.config(Config);
    app.controller('TechVidsCategoryCtrl', TechVidsCategoryCtrl);
})(OneStopTechVidsApp || (OneStopTechVidsApp = {}));
//# sourceMappingURL=techVidsApp.js.map
