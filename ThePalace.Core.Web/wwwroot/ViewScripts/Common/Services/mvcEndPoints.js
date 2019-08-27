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

    this.MediaUpload = (function (hash, data, overwrite) {
        var deferred = $q.defer();

        $http({
            url: '/Media/Upload/' + hash + '?overwrite=' + (!!overwrite).toString(),
            method: 'POST',
            data: data,
        }).then(function (response) {
            deferred.resolve(response.data);
        }, function (errors) {
            deferred.reject(errors.data);
        });

        return deferred.promise;
    });

    this.MediaDelete = (function (hash, fileName) {
        var deferred = $q.defer();

        $http({
            url: '/Media/Delete/' + hash + '?fileName=' + fileName,
            method: 'POST',
        }).then(function (response) {
            deferred.resolve(response.data);
        }, function (errors) {
            deferred.reject(errors.data);
        });

        return deferred.promise;
    });

    this.MediaIndex = (function (hash, filter, orderby, limit, offset) {
        var deferred = $q.defer();

        $http({
            url: '/Media/Index/' + hash + '?filter=' + filter + '&orderby=' + orderby + '&limit=' + limit + '&offset=' + offset,
            method: 'GET',
        }).then(function (response) {
            deferred.resolve(response.data);
        }, function (errors) {
            deferred.reject(errors.data);
        });

        return deferred.promise;
    });
}]);
