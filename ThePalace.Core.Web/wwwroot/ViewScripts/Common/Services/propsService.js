angular.module('ThePalace').service('propsService', ['$window', '$http', '$q', 'utilService', function ($window, $http, $q, utilService) {
    this.GetAsset = (function (mediaUrl, assetID) {
        var url = mediaUrl + (!mediaUrl || mediaUrl === '' || mediaUrl.substring(mediaUrl.length - 1, mediaUrl.length) !== '/' ? '/' : '') + 'webservice/props/get/';
        var deferred = $q.defer();
        var jsonString = $window.JSON.stringify({
            props: [{
                id: assetID,
            }],
            api_version: 1,
        });

        //var compressedString = $window.pako.gzip(jsonString, { to: 'string' });

        /*
        var jsonArray = utilService.NumericArray(jsonString);
        var compressedByteArray = new $window.Zlib.Gzip(jsonArray).compress();
        var compressedArray = utilService.ArrayClone(compressedByteArray);
        var compressedString = utilService.ArrayToString(compressedArray);
        */

        $http.post(url, jsonString).then(function (response) {
            deferred.resolve(response.data);
        }, function (errors) {
            deferred.reject(errors.data);
        });

        return deferred.promise;
    });
}]);
