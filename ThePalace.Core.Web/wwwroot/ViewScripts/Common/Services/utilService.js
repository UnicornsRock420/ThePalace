angular.module('ThePalace').service('utilService', ['$window', function ($window) {
    this.GetHostnameFromUrl = (function (url) {
        var a = document.createElement('a');
        a.href = url;

        return a.hostname;
    });

    this.GetPathFromUrl = (function (url) {
        var a = document.createElement('a');
        a.href = url;

        return a.href.substring(a.href.indexOf(a.hostname) + a.hostname.length);
    });

    this.SwapLong = (function (source) {
        return ((source >> 24) & 0x000000FF) |
            ((source >> 8) & 0x0000FF00) |
            ((source << 8) & 0x00FF0000) |
            ((source << 24) & 0xFF000000);
    });

    this.SwapShort = (function (source) {
        return ((source >> 8) & 0x00FF) |
            ((source << 8) & 0xFF00);
    });

    this.createUID = (function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    });

    this.WriteARGB = (function (a, r, g, b, offset, data) {
        data[offset + 3] = a;
        data[offset + 2] = b;
        data[offset + 1] = g;
        data[offset + 0] = r;
    });

    this.ReadColor = (function (offset, data) {
        var color = 0;

        color |= ((data[offset + 3] & 0x000000FF) << 24) & 0xFF000000;
        color |= ((data[offset + 2] & 0x000000FF) << 16) & 0x00FF0000;
        color |= ((data[offset + 1] & 0x000000FF) << 8) & 0x0000FF00;
        color |= (data[offset + 0] & 0x000000FF);

        return color;
    });

    this.WriteColor = (function (color, offset, data) {
        data[offset + 3] = ((color & 0xFF000000) >> 24) & 0x000000FF; //a
        data[offset + 1] = ((color & 0x0000FF00) >> 8) & 0x000000FF; //g
        data[offset + 0] = ((color & 0x00FF0000) >> 16) & 0x000000FF; //b
        data[offset + 2] = (color & 0x000000FF); //r
    });

    this.ReadByte = (function (source, offset) {
        var type = typeof source;

        if (Array.isArray(source)) {
            type = 'array';
        }

        if (!offset) {
            offset = 0;
        }

        switch (type) {
            case 'array':

                return this.ReadByte(source[offset]);
            case 'string':

                return (source.charCodeAt(offset) & 0x000000FF);
            case 'number':
                if (!!offset && offset > 0) {
                    offset %= 4;
                    offset *= 8;

                    source >>= offset;
                }

                return (source & 0x000000FF);
        }
    });

    this.ReadShort = (function (source, offset, swap, signed) {
        if (!offset) {
            offset = 0;
        }

        var returnValue = (this.ReadByte(source, 0 + offset) << 8)
            | this.ReadByte(source, 1 + offset);

        if (swap) {
            returnValue = this.SwapShort(returnValue);
        }

        if (signed) {
            returnValue = (returnValue << 16) >> 16;
        }

        return returnValue;
    });

    this.ReadInt = (function (source, offset, swap) {
        if (!offset) {
            offset = 0;
        }

        var returnValue = (this.ReadByte(source, 0 + offset) << 24)
            | (this.ReadByte(source, 1 + offset) << 16)
            | (this.ReadByte(source, 2 + offset) << 8)
            | this.ReadByte(source, 3 + offset);

        if (swap) {
            returnValue = this.SwapLong(returnValue);
        }

        return returnValue;
    });

    this.ReadPString = (function (source, max, offset, size, swap) {
        var type = typeof source;

        if (Array.isArray(source)) {
            type = 'array';
        }

        switch (type) {
            case 'array':
                var length;

                if (!offset) {
                    offset = 0;
                }

                switch (size) {
                    case 4:
                        length = this.ReadInt(source, offset, swap);

                        break;
                    case 2:
                        length = this.ReadShort(source, offset, swap);

                        break;
                    default:
                        length = this.ReadByte(source, offset);
                        size = 1;

                        break;
                }

                return String.fromCharCode.apply(null, source.slice(offset + size, offset + size + length));
            case 'string':

                return this.ReadPString(source.split(''), max, offset, size, swap);
        }
    });

    this.ReadPalaceString = (function (source) {
        var result = [];

        for (var j = 0; j < source.length;) {
            if (source.charAt(j) === '\\') {
                var hex = source.charAt(j + 1) + source.charAt(j + 2);
                var code = $window.parseInt(hex, 16);

                result.push(code);

                j += 3;
            }
            else {
                result.push(source.charCodeAt(j++));
            }
        }

        return result;
    });

    this.ReadCString = (function (source, offset) {
        var type = typeof source;

        if (Array.isArray(source)) {
            type = 'array';
        }

        switch (type) {
            case 'array':
                var charCode_NULL = 0;

                if (!offset) {
                    offset = 0;
                }

                for (var idx = 0; idx < source.length - offset; idx++) {
                    if (this.ReadByte(source, idx + offset) === charCode_NULL) {
                        return source.slice(offset, idx + offset).join('');
                    }
                }

                break;
            case 'string':

                return this.ReadPString(source.split(''), offset);
        }
    });

    this.WriteByte = (function (source, size) {
        var byteCode = this.ReadByte(source);
        var char = String.fromCharCode(byteCode);

        if (!!size && size > 0) {
            var returnValue = [];

            while (returnValue.length < size) {
                returnValue.push(char);
            }

            return returnValue.join('');
        }

        return char;
    });

    this.WriteBytes = (function (source, max, char) {
        var type = typeof source;

        if (Array.isArray(source)) {
            type = 'array';
        }

        switch (type) {
            case 'array':
                switch (typeof source[0]) {
                    case 'string':
                        if (!!max && max > 0) {
                            if (source.length > max) {
                                source.splice(max);
                            } else if (source.length < max && char) {
                                while (source.length < max) {
                                    source.push(char);
                                }
                            }
                        }

                        return source;
                    case 'number':
                        var returnValue = [];
                        var cache = {};

                        for (var idx = 0; idx < source.length; idx++) {
                            var value = source[idx];

                            if (!cache[value]) {
                                cache[value] = String.fromCharCode(value);
                            }

                            returnValue.push(cache[value]);
                        }

                        return this.WriteBytes(returnValue, max, char);
                }

                break;
            case 'string':
                return this.WriteBytes(source.split(''), max, char);
        }
    });

    this.WriteShort = (function (source, swap) {
        if (swap) {
            source = this.SwapShort(source);
        }

        return [
            this.WriteByte(source >> 8),
            this.WriteByte(source)
        ];
    });

    this.WriteInt = (function (source, swap) {
        if (swap) {
            source = this.SwapLong(source);
        }

        return [
            this.WriteByte(source >> 24),
            this.WriteByte(source >> 16),
            this.WriteByte(source >> 8),
            this.WriteByte(source)
        ];
    });

    this.WritePString = (function (source, max, size, swap) {
        var type = typeof source;

        if (Array.isArray(source)) {
            type = 'array';
        }

        switch (type) {
            case 'array':
                if (source.length > max) {
                    source = source.slice(max);
                }

                var length = source.length;
                var returnValue = [];

                while (source.length < max) {
                    source.push(this.WriteByte(0));
                }

                switch (size) {
                    case 4:
                        returnValue = this.WriteInt(length, swap);

                        break;
                    case 2:
                        returnValue = this.WriteShort(length, swap);

                        break;
                    default:
                        returnValue.push(this.WriteByte(length));
                        size = 1;

                        break;
                }

                returnValue.push.apply(returnValue, source);

                return returnValue;
            case 'string':

                return this.WritePString(source.split(''), max, size, swap);
        }
    });

    this.WritePalaceString = (function (source) {
        var result = [];

        for (var j = 0; j < source.length; j++) {
            var hex = source[j].charCodeAt(0).toString(16);

            if (hex.length < 2) {
                hex = '0' + hex;
            }

            result.push('\\' + hex);
        }

        return result.join('');
    });

    this.WriteCString = (function (source) {
        source.push(this.WriteByte(0));

        return source;
    });

    this.ToBase64 = (function (source) {
        return $window.btoa(source);
    });

    this.FromBase64 = (function (source) {
        return $window.atob(source);
    });

    this.ArrayToString = (function (source) {
        return String.fromCharCode.apply(null, source);
    });

    this.ArrayClone = (function (source) {
        return Array.prototype.slice.call(source);
    });

    this.And = (function () {
        var args = this.ArrayClone(arguments);
        var source = args.shift();
        var returnValue = true;

        switch (typeof source) {
            case 'boolean':
                returnValue &= source;

                break;
        }

        while (returnValue && args.length > 0) {
            var flags = args.shift();

            switch (typeof flags) {
                case 'boolean':
                    returnValue &= flags;

                    break;
                case 'number':
                    returnValue &= (source & flags) === flags;

                    break;
            }
        }

        return !!returnValue;
    });

    this.Or = (function () {
        var args = this.ArrayClone(arguments);
        var source = args.shift();
        var returnValue = false;

        switch (typeof source) {
            case 'boolean':
                returnValue |= source;

                break;
        }

        while (!returnValue && args.length > 0) {
            var flags = args.shift();

            switch (typeof flags) {
                case 'boolean':
                    returnValue |= flags;

                    break;
                case 'number':
                    returnValue |= (source & flags) === flags;

                    break;
            }
        }

        return !!returnValue;
    });

    this.IntToHex = (function (decimal, chars) {
        return (decimal + Math.pow(16, chars)).toString(16).slice(-chars).toUpperCase();
    });

    this.NumericArray = (function (source) {
        if (!Array.isArray(source)) {
            switch (typeof source) {
                case 'string':
                    return this.NumericArray(source.split(''));
            }

            return null;
        }

        var result = source.slice(0);

        for (var idx = 0; idx < result.length; idx++) {
            switch (typeof result[idx]) {
                case 'string':
                    result[idx] = result[idx].charCodeAt(0);

                    break;
            }
        }

        return result;
    });

    this.CharArray = (function (source) {
        if (!Array.isArray(source)) {
            switch (typeof source) {
                case 'string':
                    return this.CharArray(source.split(''));
            }

            return null;
        }

        var result = source.slice(0);

        for (var idx = 0; idx < result.length; idx++) {
            switch (typeof result[idx]) {
                case 'number':
                    result[idx] = string.fromCharCode(result[idx]);

                    break;
            }
        }

        return result;
    });

    this.getBoundingBox = (function (list) {
        if (list.length < 1) {
            return null;
        }

        var result = {
            left: list[0].h,
            top: list[0].v,
            right: list[0].h,
            bottom: list[0].v,
            width: 0,
            height: 0,
        };

        for (var j = 1; j < list.length; j++) {
            if (list[j].h < result.left) {
                result.left = list[j].h;
            }
            if (list[j].v < result.top) {
                result.top = list[j].v;
            }
            if (list[j].h > result.right) {
                result.right = list[j].h;
            }
            if (list[j].v > result.bottom) {
                result.bottom = list[j].v;
            }
        }

        result.width = result.right - result.left;
        result.height = result.bottom - result.top;

        return result;
    });

    this.pointInPolygon = (function (polygon, p) {
        var inside = false;

        for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            if ((polygon[i].v > p.v) !== (polygon[j].v > p.v) && p.h < ((polygon[j].h - polygon[i].h) * (p.v - polygon[i].v) / (polygon[j].v - polygon[i].v) + polygon[i].h)) {
                inside = !inside;
            }
        }

        return inside;
    });

    this.b64Decode = (function (str) {
        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var bytes = $window.parseInt((str.length / 4) * 3);

        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var j = 0;

        var uarray = new Uint8Array(bytes);

        str = str.replace(/[^A-Za-z0-9\+\/\=]/g, '');

        for (i = 0; i < bytes; i += 3) {
            //get the 3 octects in 4 ascii chars
            enc1 = keyStr.indexOf(str.charAt(j++));
            enc2 = keyStr.indexOf(str.charAt(j++));
            enc3 = keyStr.indexOf(str.charAt(j++));
            enc4 = keyStr.indexOf(str.charAt(j++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            uarray[i] = chr1;
            if (enc3 != 64) uarray[i + 1] = chr2;
            if (enc4 != 64) uarray[i + 2] = chr3;
        }

        return uarray;
    });

    //this.Xor = (function () {
    //    var args = this.ArrayClone(arguments);
    //    var returnValue = args.shift();

    //    while (args.length > 0) {
    //        var flags = args.shift();

    //        switch (typeof flags) {
    //            case 'boolean':
    //                returnValue ^= flags;

    //                break;
    //            case 'number':
    //                returnValue ^= (source & flags) == flags;

    //                break;
    //        }
    //    }

    //    return !!returnValue;
    //});
}]);
