angular.module('ThePalace').factory('Prop',
    ['$window', 'PalacePalette', 'PropFlags', 'PropFormats', 'HiResPropFlags', 'ServerAssetFlags', 'Asset', 'Packet', 'utilService', 'propsService', 'CanvasNode', 'ImageObject',
        function ($window, PalacePalette, PropFlags, PropFormats, HiResPropFlags, ServerAssetFlags, Asset, Packet, utilService, propsService, CanvasNode, ImageObject) {
            var ditherS20bit = (255 / 31);
            var dither20bit = (255 / 63);
            var dither16bit = (31 / 255);
            var $scope = null;

            var gCrcMagic = 0xD9216290;
            var gFormatMask = (PropFormats.PF_20Bit | PropFormats.PF_S20Bit | PropFormats.PF_32Bit);

            var Prop = (function (scope, assetId, assetCrc, assetType, assetData) {
                this.$scope = scope;
                this.asset = new Asset(assetId, assetCrc, assetType);
                this.asset.data = assetData || null;
            });

            Prop.prototype = {
                endian: false,
                imageUrl: null,
                imageObject: null,
                asset: null,
                horizontalOffset: 0,
                verticalOffset: 0,
                scriptOffset: 0,
                ready: false,
                badProp: false,
                head: false,
                ghost: false,
                rare: false,
                animate: false,
                palindrome: false,
                bounce: false,
                webServiceFormat: '',
                propFormat: 0x0,
                flags: 0,
                height: 0,
                width: 0,

                cloneObject: (function (source) {
                    if (!source) {
                        source = this;
                    }

                    var prop = new Prop(source.asset.id, source.asset.crc);
                    prop.endian = source.endian;

                    prop.animate = source.animate;
                    prop.height = source.height;
                    prop.width = source.width;
                    prop.rare = source.rare;
                    prop.head = source.head;
                    prop.ghost = source.ghost;
                    prop.palindrome = source.palindrome;
                    prop.bounce = source.bounce;
                    prop.shownametag = source.shownametag;
                    prop.webServiceFormat = source.webServiceFormat;
                    prop.propFormat = source.propFormat;
                    prop.flags = source.flags;
                    prop.horizontalOffset = source.horizontalOffset;
                    prop.verticalOffset = source.verticalOffset;
                    prop.scriptOffset = source.scriptOffset;
                    prop.ready = source.ready;
                    prop.badProp = source.badProp;

                    prop.asset.data = source.asset.data;
                    prop.asset.flags = source.asset.flags;
                    prop.asset.type = source.asset.type;
                    prop.asset.name = source.asset.name;
                    prop.asset.temporaryIdentifier = source.asset.temporaryIdentifier;
                    prop.asset.imageDataUrl = source.asset.imageDataUrl;

                    return prop;
                }),

                readFlags: (function () {
                    if ((this.asset.flags & ServerAssetFlags.HighResProp) !== 0) {
                        this.flags = parseInt(this.flags + '', 16);

                        this.head = (this.flags & HiResPropFlags.PF_Head) !== 0;
                        this.ghost = (this.flags & HiResPropFlags.PF_Ghost) !== 0;
                        this.animate = (this.flags & HiResPropFlags.PF_Animate) !== 0;
                        this.bounce = (this.flags & HiResPropFlags.PF_Bounce) !== 0;
                    } else {
                        this.head = (this.flags & PropFlags.PF_Head) !== 0;
                        this.ghost = (this.flags & PropFlags.PF_Ghost) !== 0;
                        this.rare = (this.flags & PropFlags.PF_Rare) !== 0;
                        this.animate = (this.flags & PropFlags.PF_Animate) !== 0;
                        this.palindrome = (this.flags & PropFlags.PF_Palindrome) !== 0;
                        this.bounce = (this.flags & PropFlags.PF_Bounce) !== 0;
                    }
                }),

                decodeProp: (function (mediaUrl) {
                    if (this.badProp || this.ready) {
                        return;
                    }

                    if ((this.asset.flags & ServerAssetFlags.HighResProp) !== 0) {
                        var that = this;
                        propsService.GetAsset(mediaUrl, this.asset.id).then(function (response) {
                            if (that.asset.id !== response.props[0].id) return;

                            that.flags = $window.parseInt(response.props[0].flags, 10);
                            that.width = response.props[0].size.w;
                            that.height = response.props[0].size.h;
                            that.horizontalOffset = response.props[0].offsets.x;
                            that.verticalOffset = response.props[0].offsets.y;
                            that.imageUrl = response.img_url + (response.img_url.substring(response.img_url.length - 1, response.img_url.length) === '/' ? '' : '/') + that.asset.id;
                            that.imageObject = new ImageObject({
                                sourceUrl: that.imageUrl,
                                resolve: function (response) {
                                    that.readFlags();

                                    that.ready = true;

                                    that.$scope.Screen_OnDraw('spriteLayerUpdate', 'loosepropLayerUpdate');
                                },
                                reject: function (errors) {
                                },
                            });
                            that.imageObject.load();
                        }, function (errors) {
                        });
                    }
                    else if (!this.asset.data || !this.asset.data.length) {
                        return;
                    }
                    else {
                        var packet = new Packet(this.asset.data, true);
                        packet.endian = this.endian;

                        this.width = packet.ReadShort();
                        this.height = packet.ReadShort();
                        this.horizontalOffset = packet.ReadShort(true);
                        this.verticalOffset = packet.ReadShort(true);
                        this.scriptOffset = packet.ReadShort();
                        this.flags = packet.ReadShort();

                        this.readFlags();

                        this.asset.data = utilService.NumericArray(packet.getRawData());

                        this.propFormat = this.flags & gFormatMask;

                        if (utilService.And(this.flags & 0xFFC1, PropFormats.PF_16Bit)) {
                            this.webServiceFormat = '16bit';
                            this.decode16BitProp();
                        }
                        else if (utilService.And(this.propFormat, PropFormats.PF_S20Bit)) {
                            this.webServiceFormat = 's20bit';
                            this.decodeS20BitProp();
                        }
                        else if (utilService.And(this.propFormat, PropFormats.PF_32Bit)) {
                            this.webServiceFormat = '32bit';
                            this.decode32BitProp();
                        }
                        else if (utilService.And(this.propFormat, PropFormats.PF_20Bit)) {
                            this.webServiceFormat = '20bit';
                            this.decode20BitProp();
                        }
                        else {
                            this.webServiceFormat = '8bit';
                            this.decode8BitProp();
                        }

                        if (!this.badProp) {
                            this.ready = true;
                        }
                    }
                }),

                computeCrc: (function (data) {
                    var crc = gCrcMagic;

                    for (var len = data.length - 1; len >= 0; len--) {
                        crc = ((crc << 1) | ((crc & 0x80000000) ? 1 : 0)) ^ data[len];
                    }

                    return crc;
                }),

                decode8BitProp: (function () {
                    if (this.badProp || this.ready) {
                        return;
                    }

                    // Translated from ActionScript implementation (Turtle)

                    var canvas = new CanvasNode();
                    var imageData = canvas.createImageData(this.width, this.height);
                    var pixelIndex = 0;
                    var counter = 0;
                    var ofst = 0;

                    for (var y = this.height - 1; y >= 0; y--) {
                        for (var x = this.width; x > 0;) {
                            var cb = this.asset.data[ofst++] & 0xFF;
                            var pc = cb & 0x0F;
                            var mc = cb >> 4;

                            x -= mc + pc;

                            if (x < 0 || counter++ > 6000) {
                                if (counter > 6000) {
                                    // script runaway protection
                                    console.log('There was an error while decoding props. Max loop count exceeded.');
                                }

                                this.badProp = true;
                                this.ready = false;

                                this.asset.data = null;

                                return;
                            };

                            pixelIndex += mc;

                            while (pc-- > 0 && ofst < this.asset.data.length) {
                                var cb = this.asset.data[ofst++] & 0xFF;

                                utilService.WriteColor(PalacePalette[cb], (pixelIndex++ * 4), imageData.data);
                            }
                        }
                    }

                    this.asset.data = imageData;
                }),

                decode16BitProp: (function () {
                    if (this.badProp || this.ready) {
                        return;
                    }

                    var assetData;

                    try {
                        var inflate = new $window.Zlib.Inflate(this.asset.data);
                        assetData = inflate.decompress();
                    } catch (ex) {
                        assetData = null;
                    }

                    if (!assetData || assetData.length < (1936 * 2)) {
                        this.badProp = true;
                        this.ready = false;

                        this.asset.data = null;

                        return;
                    }

                    // Implementation thanks to Phalanx team
                    // Translated from C++ implementation
                    // Translated from ActionScript implementation (Turtle)

                    var canvas = new CanvasNode();
                    var imageData = canvas.createImageData(this.width, this.height);
                    var ofst, x, y, a, r, g, b, C;

                    for (x = 0; x < 1936; x++) {
                        ofst = x * 2;

                        C = (assetData[ofst] << 8) | assetData[ofst + 1];
                        r = $window.parseInt(($window.parseInt(assetData[ofst] >> 3) & 31) * ditherS20bit) & 0xFF;
                        g = $window.parseInt(($window.parseInt(C >> 6) & 31) * ditherS20bit) & 0xFF;
                        b = $window.parseInt(($window.parseInt(C >> 1) & 31) * ditherS20bit) & 0xFF;
                        a = (C & 1) * 255 & 0xFF;

                        utilService.WriteARGB(a, r, g, b, y++ * 4, imageData.data);
                    }

                    this.asset.data = imageData;
                }),

                decode20BitProp: (function () {
                    if (this.badProp || this.ready) {
                        return;
                    }

                    var assetData;

                    try {
                        var inflate = new $window.Zlib.Inflate(this.asset.data);
                        assetData = inflate.decompress();
                    } catch (ex) {
                        assetData = null;
                    }

                    if (!assetData || assetData.length < (968 * 5)) {
                        this.badProp = true;
                        this.ready = false;

                        this.asset.data = null;

                        return;
                    }

                    // Implementation thanks to Phalanx team
                    // Translated from VB6 implementation
                    // Translated from ActionScript implementation (Turtle)

                    var canvas = new CanvasNode();
                    var imageData = canvas.createImageData(this.width, this.height);
                    var ofst, x, y, a, r, g, b, C;

                    for (x = 0, y = 0; x < 968; x++) {
                        ofst = x * 5;

                        r = $window.parseInt(($window.parseInt(assetData[ofst] >> 2) & 63) * dither20bit);
                        C = (assetData[ofst] << 8) | assetData[ofst + 1];
                        g = $window.parseInt(((C >> 4) & 63) * dither20bit);
                        C = (assetData[ofst + 1] << 8) | assetData[ofst + 2];
                        b = $window.parseInt(((C >> 6) & 63) * dither20bit);
                        a = (((C >> 4) & 3) * 85);

                        utilService.WriteARGB(a, r, g, b, y++ * 4, imageData.data);

                        C = (assetData[ofst + 2] << 8) | assetData[ofst + 3];
                        r = $window.parseInt(((C >> 6) & 63) * dither20bit);
                        g = $window.parseInt((C & 63) * dither20bit);
                        C = assetData[ofst + 4];
                        b = $window.parseInt(((C >> 2) & 63) * dither20bit);
                        a = ((C & 3) * 85);

                        utilService.WriteARGB(a, r, g, b, y++ * 4, imageData.data);
                    }

                    this.asset.data = imageData;
                }),

                decodeS20BitProp: (function () {
                    if (this.badProp || this.ready) {
                        return;
                    }

                    var assetData;

                    try {
                        var inflate = new $window.Zlib.Inflate(this.asset.data);
                        assetData = inflate.decompress();
                    } catch (ex) {
                        assetData = null;
                    }

                    if (!assetData || assetData.length < (968 * 5)) {
                        this.badProp = true;
                        this.ready = false;

                        this.asset.data = null;

                        return;
                    }

                    // Implementation thanks to Phalanx team
                    // Translated from C++ implementation
                    // Translated from ActionScript implementation (Turtle)

                    var canvas = new CanvasNode();
                    var imageData = canvas.createImageData(this.width, this.height);
                    var ofst, x, y, a, r, g, b, C;

                    for (x = 0, y = 0; x < 968; x++) {
                        ofst = x * 5;

                        r = $window.parseInt(((assetData[ofst] >> 3) & 31) * ditherS20bit) & 0xFF;
                        C = (assetData[ofst] << 8) | assetData[ofst + 1];
                        g = $window.parseInt((C >> 6 & 31) * ditherS20bit) & 0xFF;
                        b = $window.parseInt((C >> 1 & 31) * ditherS20bit) & 0xFF;
                        C = (assetData[ofst + 1] << 8) | assetData[ofst + 2];
                        a = $window.parseInt((C >> 4 & 31) * ditherS20bit) & 0xFF;

                        utilService.WriteARGB(a, r, g, b, y++ * 4, imageData.data);

                        C = (assetData[ofst + 2] << 8) | assetData[ofst + 3];
                        r = $window.parseInt((C >> 7 & 31) * ditherS20bit) & 0xFF;
                        g = $window.parseInt((C >> 2 & 31) * ditherS20bit) & 0xFF;
                        C = (assetData[ofst + 3] << 8) | assetData[ofst + 4];
                        b = $window.parseInt((C >> 5 & 31) * ditherS20bit) & 0xFF;
                        a = $window.parseInt((C & 31) * ditherS20bit) & 0xFF;

                        utilService.WriteARGB(a, r, g, b, y++ * 4, imageData.data);
                    }

                    this.asset.data = imageData;
                }),

                decode32BitProp: (function () {
                    if (this.badProp || this.ready) {
                        return;
                    }

                    var assetData;

                    try {
                        var inflate = new $window.Zlib.Inflate(this.asset.data);
                        assetData = inflate.decompress();
                    } catch (ex) {
                        assetData = null;
                    }

                    var imageDataSize = (this.width * this.height * 4);

                    if (!assetData || assetData.length !== imageDataSize) {
                        this.badProp = true;
                        this.ready = false;

                        this.asset.data = null;

                        return;
                    }

                    // Implementation thanks to Phalanx team
                    // Translated from VB6 implementation
                    // Translated from ActionScript implementation (Turtle)

                    var canvas = new CanvasNode();
                    var imageData = canvas.createImageData(this.width, this.height);

                    for (var b = 0; b < imageDataSize; b++) {
                        imageData.data[b] = assetData[b];
                    }

                    this.asset.data = imageData;
                }),

                encodeS20BitProp: (function () {
                    if (this.badProp || !this.ready) {
                        return;
                    }

                    // Implementation ported from REALBasic code provided by
                    // Jameson Heesen (Pa\/\/n), of PalaceChat

                    var packet = new Packet();
                    packet.endian = this.endian;

                    var intComp = 0;

                    for (var y = 0; y < 44; y++) {
                        for (var x = 0; x < 44; x++) {
                            //var color = this.asset.data[(y * 44) + x];

                            //var a = ((color & 0xFF000000) >> 24) & 0x000000FF;
                            //var r = ((color & 0x00FF0000) >> 16) & 0x000000FF;
                            //var g = ((color & 0x0000FF00) >> 8) & 0x000000FF;
                            //var b = (color & 0x000000FF);

                            var pixelIndex = (((y * 44) + x) * 4);

                            var a = this.asset.data[pixelIndex + 3];
                            var r = this.asset.data[pixelIndex + 2];
                            var g = this.asset.data[pixelIndex + 1];
                            var b = this.asset.data[pixelIndex + 0];

                            if (x % 2 === 0) {
                                intComp |= ($window.parseInt(Math.round(r * dither16bit)) << 19);
                                intComp |= ($window.parseInt(Math.round(g * dither16bit)) << 14);
                                intComp |= ($window.parseInt(Math.round(b * dither16bit)) << 9);
                                intComp |= ($window.parseInt(Math.round(a * dither16bit)) << 4);

                                packet.WriteByte((intComp & 0x00FF0000) >> 16);
                                packet.WriteByte((intComp & 0x0000FF00) >> 8);

                                intComp = (intComp & 0x000000F0) << 16;
                            } else {
                                intComp |= ($window.parseInt(Math.round(r * dither16bit)) << 15);
                                intComp |= ($window.parseInt(Math.round(g * dither16bit)) << 10);
                                intComp |= ($window.parseInt(Math.round(b * dither16bit)) << 5);
                                intComp |= $window.parseInt(Math.round(a * dither16bit));

                                packet.WriteByte((intComp & 0x00FF0000) >> 16);
                                packet.WriteByte((intComp & 0x0000FF00) >> 8);
                                packet.WriteByte(intComp & 0x000000FF);

                                intComp = 0;
                            }
                        }
                    }

                    var data = packet.getDataUint8Array();

                    try {
                        var deflate = new $window.Zlib.Deflate(data);
                        data = deflate.compress();
                    } catch (ex) {
                        data = null;
                    }

                    return data;
                }),
            };

            return Prop;
        }]);
