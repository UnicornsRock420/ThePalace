angular.module('ThePalace').factory('LooseProp', [function () {
    var LooseProp = (function (scope) {
        this.scope = scope;
    });

    LooseProp.prototype = {
        scope: null,
        locPosY: 0,
        locPosX: 0,
        prop: null,
    };

    return LooseProp;
}]);
