angular.module('ThePalace').factory('Asset', ['AssetTypes', function (AssetTypes) {
    var Asset = (function (assetId, assetCrc, assetType) {
        this.id = assetId;
        this.crc = assetCrc || 0;
        this.type = assetType || AssetTypes.Prop;
    });

    Asset.prototype = {
        id: 0,
        crc: 0,
        type: 0,
        name: '',
        flags: 0,
        data: [],
    };

    return Asset;
}]);
