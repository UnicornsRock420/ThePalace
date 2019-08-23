angular.module('ThePalace').factory('Packet', ['utilService', function (utilService) {
    var Packet = (function (data, raw, offset) {
        if (!data) {
            data = '';
        }

        if (data === '' || raw) {
            this.setRawData(data, offset);
        } else {
            this.setData(data, offset);
        }
    });

    Packet.prototype = {
        endian: false,
        data: '',
        getData: (function () {
            var data = utilService.CharArray(this.data).join('');

            return utilService.ToBase64(data);
        }),
        getRawData: (function () {
            return this.data;
        }),
        getDataUint8Array: (function () {
            var data = utilService.NumericArray(this.data);

            return new Uint8Array(data);
        }),
        getDataNumericArray: (function () {
            return utilService.NumericArray(this.data);
        }),
        getDataCharArray: (function () {
            return utilService.CharArray(this.data);
        }),
        setData: (function (value, offset) {
            this.data = utilService.FromBase64(value).split('');

            if (!!offset) {
                this.data.splice(0, offset);
            }
        }),
        setRawData: (function (value, offset) {
            var type = typeof value;

            if (Array.isArray(value)) {
                type = 'array';
            }

            switch (type) {
                case 'array':
                    this.data = value.slice(0);

                    break;
                case 'string':
                    this.data = value.split('');

                    break;
            }

            if (!!offset) {
                this.data.splice(0, offset);
            }
        }),
        getLength: (function () {
            return this.data.length;
        }),
        ReadByte: (function () {
            var _data = this.data.splice(0, 1);

            return utilService.ReadByte(_data, 0);
        }),
        ReadShort: (function (signed) {
            var _data = this.data.splice(0, 2);

            return utilService.ReadShort(_data, 0, this.endian, signed);
        }),
        ReadInt: (function () {
            var _data = this.data.splice(0, 4);

            return utilService.ReadInt(_data, 0, this.endian);
        }),
        PeekByte: (function () {
            var _data = this.data.slice(0, 1);

            return utilService.ReadByte(_data, 0);
        }),
        PeekShort: (function () {
            var _data = this.data.slice(0, 2);

            return utilService.ReadShort(_data, 0, this.endian);
        }),
        PeekInt: (function () {
            var _data = this.data.slice(0, 4);

            return utilService.ReadInt(_data, 0, this.endian);
        }),
        ReadPString: (function (max, offset, size) {
            if (!offset) {
                offset = 0;
            }

            if (!size) {
                size = 1;
            }

            var _data = this.data.splice(0, max);

            return utilService.ReadPString(_data, max, offset, size, this.endian);
        }),
        ReadCString: (function (offset) {
            if (!offset) {
                offset = 0;
            }

            var returnValue = utilService.ReadCString(this.data, offset);

            this.data.splice(0, returnValue.length);

            return returnValue;
        }),
        WriteByte: (function (source, size) {
            this.data.push.apply(this.data, utilService.WriteByte(source, size).split(''));
        }),
        WriteBytes: (function (source, max, char) {
            this.data.push.apply(this.data, utilService.WriteBytes(source, max, char));
        }),
        WriteShort: (function (source) {
            this.data.push.apply(this.data, utilService.WriteShort(source, this.endian));
        }),
        WriteInt: (function (source) {
            this.data.push.apply(this.data, utilService.WriteInt(source, this.endian));
        }),
        WritePString: (function (source, max) {
            this.data.push.apply(this.data, utilService.WritePString(source, max));
        }),
        WriteCString: (function (source) {
            this.data.push.apply(this.data, utilService.WriteCString(source));
        }),
    };

    return Packet;
}]);
