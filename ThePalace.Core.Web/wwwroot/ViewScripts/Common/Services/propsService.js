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

    this.NewAsset = (function (mediaUrl, propSpecs) {
        var props = [];

        for (var j = 0; j < propSpecs.length; j++) {
            var prop = {
                id: propSpecs[j].id,
                crc: propSpecs[j].crc,
                name: propSpecs[j].prop.asset.name,
                format: 'png',
                flags: 0,
                size: {
                    h: propSpecs[j].prop.imageObject.height,
                    w: propSpecs[j].prop.imageObject.width,
                },
                offsets: {
                    y: propSpecs[j].prop.verticalOffset,
                    x: propSpecs[j].prop.horizontalOffset,
                },
            };

            props.push(prop);
        }

        var url = mediaUrl + (!mediaUrl || mediaUrl === '' || mediaUrl.substring(mediaUrl.length - 1, mediaUrl.length) !== '/' ? '/' : '') + 'webservice/props/new/';
        var deferred = $q.defer();
        var jsonString = $window.JSON.stringify({
            props: props,
            api_version: 1,
        });

        $http.post(url, jsonString).then(function (response) {
            deferred.resolve(response.data);
        }, function (errors) {
            deferred.reject(errors.data);
        });

        return deferred.promise;
    });

    this.UploadAsset = (function (mediaUrl, propSpec) {
        var deferred = $q.defer();

        if (!propSpec.prop.imageObject.image.src.startsWith('data:image/png;base64,')) {
            deferred.reject();

            return;
        }

        var url = mediaUrl + (!mediaUrl || mediaUrl === '' || mediaUrl.substring(mediaUrl.length - 1, mediaUrl.length) !== '/' ? '/' : '') + 'webservice/props/upload/';
        var b64Str = propSpec.prop.imageObject.image.src.substring('data:image/png;base64,'.length);
        var b64Ary = utilService.b64Decode(b64Str);
        var imageData = utilService.ArrayClone(b64Ary);
        var boundary = 'AephixCoreBoundary-' + utilService.createUID();
        var data = [];

        function appendRange(range) {
            if (typeof (range) === 'string') {
                range = utilService.NumericArray(range.split(''));
            }

            if (Array.isArray(range)) {
                for (var j = 0; j < range.length; j++) {
                    data.push(range[j]);
                }
            }
        }

        appendRange("\r\n" + '--' + boundary);
        appendRange("\r\n" + 'Content-Disposition: form-data; name="id"');
        appendRange("\r\n\r\n");
        appendRange(propSpec.id.toString());
        appendRange("\r\n" + '--' + boundary);
        appendRange("\r\n" + 'Content-Disposition: form-data; name="prop"');
        appendRange("\r\n\r\n");
        appendRange(imageData);
        appendRange("\r\n" + '--' + boundary);

        $http({
            url: url,
            method: 'POST',
            transformRequest: [],
            data: new Uint8Array(data),
            headers: {
                'Content-Type': 'multipart/form-data; charset=UTF-8; boundary=' + boundary,
            },
        }).then(function (response) {
            deferred.resolve(response.data);
        }, function (errors) {
            deferred.reject(errors.data);
        });

        return deferred.promise;
    });
}]);
