/// <reference path="../scripts/typings/angularjs/angular.d.ts" />

module HomePageApp {

    interface IAdminBoxScope {
        syncMemberships(): void;
        lastOpMessage: string;

    }

    class AdminBoxController {

        $scope: IAdminBoxScope;
        $http: ng.IHttpService;

        constructor($scope: IAdminBoxScope, $http: ng.IHttpService) {
            this.$scope = $scope;
            this.$http = $http;

            var self = this;
            this.$scope.syncMemberships = function () { self.SyncMemberships(); };
            this.$scope.lastOpMessage = "Welcome";

            if (this.$http === null) {
                this.$scope.lastOpMessage = "Error getting hte http service!!!";
            }
        }

        SyncMemberships(): void {
            var requestConfig: ng.IRequestShortcutConfig = null;
            var self = this;
            
            self.$http.post("/api/FixStuff", { userName: "$all" }, requestConfig)
                .then(function (result: any) {
                    self.$scope.lastOpMessage = "Successfully synced " + result.data + " memberships!";
                }, function (error: any) {
                    self.$scope.lastOpMessage = "An error occured when trying to sync memberships: " + error.Message;
                });
        }

        static $inject = ['$scope', "$http"];
    }

    angular.module("homePageApp")
        .controller("adminBoxCtrl", AdminBoxController);
}