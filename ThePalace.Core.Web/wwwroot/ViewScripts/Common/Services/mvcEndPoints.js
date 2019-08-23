angular.module('ThePalace').service('mvcEndPoints', ['$http', '$q', function ($http, $q) {
    this.ViewRoom = (function (roomID) {
        var deferred = $q.defer();

        $http({
            url: '/user/ViewRoom/' + roomID,
            method: 'GET',
        }).then(function (response) {
            deferred.resolve(response.data);
        }, function (errors) {
            deferred.reject(errors.data);
        });

        return deferred.promise;
    });

    this.GetAsset = (function (assetID) {
        var deferred = $q.defer();

        $http({
            url: '/user/GetAsset/' + assetID,
            responseType: 'arraybuffer',
            method: 'GET',
        }).then(function (response) {
            var data = new Uint8Array(response.data);
            data = [].slice.call(data);

            deferred.resolve(data);
        }, function (errors) {
            deferred.reject(errors.data);
        });

        return deferred.promise;
    });
}]);
