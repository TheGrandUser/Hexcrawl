///<reference path="../scripts/typings/angularjs/angular.d.ts" />
///<reference path="../scripts/typings/angularjs/angular-route.d.ts" />

module Extensions {

    export class Video {
        id: number;
        title: string;
        description: string;
        author: string;
        rating: number;
        category: number;
    }

    export class Category {
        id: number;
        name: string;
    }

    export interface ITechVidsCategoryScope extends ng.IScope {
        categories: Array<Category>;
    }
}

module OneStopTechVidsApp {

    export class Config {
        constructor($routeProvider: ng.route.IRouteProvider) {
            $routeProvider
                .when("/list", { templateUrl: "App/Templates/VideoList.html", controller: "TechVidsListCtrl" })
                .when("/list/:id", { templateUrl: "App/Templates/VideoList.html", controller: "TechVidsListCtrl" })
                .when("/add", { templateUrl: "App/Templates/AddVideo.html", controller: "AddTechVideoCtrl" })
                .when("/edit/:id", { templateUrl: "App/Templates/EditVideo.html", controller: "EditTechVideoCtrl" })
                .otherwise({ redirectTo: '/list' });
        }
    }

    Config.$inject = ['$routeProvider'];

    export class TechVidsDataSvc {
        private videos: Array<Extensions.Video>;
        private categories: Array<Extensions.Category>;
        private techVidsApiPath: string;
        private categoriesApiPath: string;
        private httpService: ng.IHttpService;
        private qService: ng.IQService;

        constructor($http: ng.IHttpService, $q: ng.IQService) {
            this.techVidsApiPath = "api/techVideos";
            this.categoriesApiPath = "api/categories";

            this.httpService = $http;
            this.qService = $q;
        }

        public static TechVidsDataSvcFactory($http: ng.IHttpService, $q: ng.IQService) {
            return new TechVidsDataSvc($http, $q);
        }

        getAllVideos(fetchFromService?: boolean): ng.IPromise<any> {
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

            function getVideosFromService(): ng.IPromise<any> {
                var deferred = self.qService.defer();

                self.httpService.get(self.techVidsApiPath).then(function (result: any) {
                    self.videos = result.data;
                    deferred.resolve(self.videos);
                }, function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            }
        }

        addVideo(video: Extensions.Video): ng.IPromise<any> {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.post(self.techVidsApiPath, video)
                .then(function (result: any) {
                    video.id = result.data.id;
                    self.videos.push(video);
                    deferred.resolve();
                },
                function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        checkIfVideoExists(title: string): ng.IPromise<any> {
            var self = this;

            var deferred = self.qService.defer();

            self.httpService.get(self.techVidsApiPath + "?title=" + title)
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        getVideosByCategory(id: number): ng.IPromise<any> {
            var self = this;

            var filteredVideos: Array<Extensions.Video> = [];

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
        }

        getVideo(id: number): ng.IPromise<any> {
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
        }


        getAllCategories(): ng.IPromise<any> {
            var self = this;

            if (self.categories !== undefined) {
                return self.qService.when(this.categories);
            } else {
                var deferred = self.qService.defer();

                self.httpService.get(self.categoriesApiPath).then(function (result: any) {
                    self.categories = result.data;
                    deferred.resolve(self.categories);
                }, function (error) {
                        deferred.reject(error);
                    });


                return deferred.promise;
            }
        }

        getCategory(id: number): ng.IPromise<any> {
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


        }


        updateVideo(video: Extensions.Video): ng.IPromise<any> {
            var self = this;
            var deferred = self.qService.defer();


            self.httpService.put(self.techVidsApiPath + "/" + video.id, video)
                .then(function (data) {
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
        }

        deleteVideo(id: number): ng.IPromise<any> {
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
        }

        setRating(id: number, rating: number): ng.IPromise<any> {
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
        }
    }

    export class TechVidsCategoryCtrl {
        private $scope: Extensions.ITechVidsCategoryScope;
        private dataSvc: TechVidsDataSvc;

        private init(): void {
            var self = this;

            self.dataSvc.getAllCategories().then(function (data) {
                self.$scope.categories = data;
            });
        }

        constructor($scope: Extensions.ITechVidsCategoryScope,
            techVidsDataSvc: TechVidsDataSvc) {
            this.$scope = $scope;
            this.dataSvc = techVidsDataSvc;

            this.init();
        }
    }
    TechVidsCategoryCtrl.$inject = ['$scope', 'techVidsDataSvc'];

    var app = angular.module("techVidsApp", ['ngRoute']);
    app.config(Config);
    app.controller('TechVidsCategoryCtrl', TechVidsCategoryCtrl);
    //app.controller('TechVidsListCtrl', TechVidsListCtrl);
}