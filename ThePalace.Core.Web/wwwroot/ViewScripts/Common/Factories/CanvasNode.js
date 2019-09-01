angular.module('ThePalace').factory('CanvasNode', ['$window', '$document', function ($window, $document) {
    var CanvasNode = (function (contextType, domElement) {
        this.contextType = (arguments.length ? contextType : null) || '2d';

        this.canvas = domElement && domElement.get(0) || $document.get(0).createElement('canvas');
        this.context = this.canvas.getContext(this.contextType);

        this.context.lineCap = 'round';
    });

    CanvasNode.prototype = {
        contextType: null,
        canvas: null,
        context: null,
        imageData: null,
        /* Start Properties */
        width: (function (value) {
            if (arguments.length < 1) {
                return $window.parseInt(this.canvas.width);
            } else if (value && typeof value === 'number') {
                this.canvas.width = $window.parseInt(value);
            }
        }),
        height: (function (value) {
            if (arguments.length < 1) {
                return $window.parseInt(this.canvas.height);
            } else if (value && typeof value === 'number') {
                this.canvas.height = $window.parseInt(value);
            }
        }),
        lineCap: (function (value) {
            if (arguments.length < 1) {
                return this.context.lineCap;
            } else if (value && typeof value === 'string') {
                this.context.lineCap = value;
            }
        }),
        fontStyle: (function (value) {
            if (arguments.length < 1) {
                return this.context.font;
            } else if (value && typeof value === 'string') {
                this.context.font = value;
            }
        }),
        /* End Properties */
        /* Start Methods */
        getTextWidth: (function (text, fontStyle) {
            if (fontStyle) {
                this.setFontStyle(fontStyle);
            }

            var metrics = this.context.measureText(text);

            return metrics.width;
        }),
        setPixelData: (function (x, y, r, b, g, a, w) {
            if (arguments.length < 1) {
                return;
            }

            var delta = 0;

            if (w === undefined || w < 1) {
                w = 1;
            }

            if (w > 1) {
                delta = $window.parseInt(w / 2);
            }

            if (x && y && r !== undefined && g !== undefined && b !== undefined) {
                this.imageData = this.context.getImageData(x - delta, y - delta, w + delta, w + delta);

                for (var j = 0; j < this.imageData.data.length; j += 4) {
                    this.imageData.data[j + 0] = b;
                    this.imageData.data[j + 1] = g;
                    this.imageData.data[j + 2] = r;

                    if (a !== undefined) {
                        this.imageData.data[j + 3] = a;
                    }
                }

                this.context.putImageData(this.imageData, x - delta, y - delta, 0, 0, w + delta, w + delta);
            }
        }),
        getPixelData: (function (x, y) {
            if (x && y) {
                var imageData = this.context.getImageData(x, y, 1, 1);

                return [
                    imageData.data[2], //r
                    imageData.data[0], //b
                    imageData.data[1], //g
                    imageData.data[3], //a
                ];
            }
        }),
        /* End Methods */
        /* Start Wrapper Apis */
        strokeStyle: (function (value) {
            if (arguments.length < 1) {
                return;
            }

            if (value !== undefined) {
                this.context.strokeStyle = value;
            }
        }),
        strokeStyleRgba: (function (r, g, b, a) {
            if (arguments.length < 1) {
                return;
            }

            if (r !== undefined && g !== undefined && b !== undefined) {
                if (a !== undefined) {
                    this.context.strokeStyle = (''.concat('rgba(', r, ', ', g, ', ', b, ', ', a, ')'));
                } else {
                    this.context.strokeStyle = (''.concat('rgb(', r, ', ', g, ', ', b, ')'));
                }
            }
        }),
        beginPath: (function () {
            this.context.beginPath();
        }),
        closePath: (function () {
            this.context.closePath();
        }),
        restore: (function () {
            this.context.restore();
        }),
        save: (function () {
            this.context.save();
        }),
        translate: (function (cx, cy) {
            if (arguments.length < 2) {
                return;
            }

            this.context.beginPath();
            this.context.translate(cx, cy);
        }),
        setTransform: (function (x1, x2, x3, x4, x5, x6) {
            this.context.setTransform(x1, x2, x3, x4, x5, x6);
        }),
        toDataURL: (function (type) {
            return this.canvas.toDataURL(type);
        }),
        scale: (function (rx, ry) {
            if (arguments.length < 2) {
                return;
            }

            this.context.scale(rx, ry);
        }),
        arc: (function (x, y, radius, startAngle, endAngle, antiClockwise) {
            if (arguments.length < 1) {
                return;
            }

            this.context.arc(x, y, radius, startAngle, endAngle, antiClockwise);
        }),
        lineJoin: (function (value) {
            if (arguments.length < 1) {
                return;
            }

            if (value !== undefined) {
                this.context.lineJoin = value;
            }
        }),
        lineWidth: (function (value) {
            if (arguments.length < 1) {
                return;
            }

            if (value !== undefined) {
                this.context.lineWidth = value;
            }
        }),
        globalAlpha: (function (value) {
            if (arguments.length < 1) {
                return;
            }

            if (value !== undefined) {
                this.context.globalAlpha = value;
            }
        }),
        globalCompositeOperation: (function (value) {
            if (arguments.length < 1) {
                return;
            }

            if (value !== undefined) {
                this.context.globalCompositeOperation = value;
            }
        }),
        fillStyle: (function (value) {
            if (arguments.length < 1) {
                return;
            }

            if (value !== undefined) {
                this.context.fillStyle = value;
            }
        }),
        fillStyleRgba: (function (r, g, b, a) {
            if (arguments.length < 1) {
                return;
            }

            if (r !== undefined && g !== undefined && b !== undefined) {
                if (a !== undefined) {
                    this.context.fillStyle = (''.concat('rgba(', r, ', ', g, ', ', b, ', ', a, ')'));
                } else {
                    this.context.fillStyle = (''.concat('rgb(', r, ', ', g, ', ', b, ')'));
                }
            }
        }),
        //fillStyleLinearGradient: (function () {
        //}),
        drawRect: (function (x, y, width, height, fill) {
            if (arguments.length < 5) {
                fill = false;
            }

            if (arguments.length < 4) {
                height = this.height();
            }

            if (arguments.length < 3) {
                width = this.width();
            }

            if (arguments.length < 2) {
                y = 0;
            }

            if (arguments.length < 1) {
                x = 0;
            }

            if (fill === false) {
                this.context.strokeRect(x, y, width, height);
            } else {
                this.context.fillRect(x, y, width, height);
            }
        }),
        drawText: (function (text, x, y, maxWidth, fill) {
            if (arguments.length < 5) {
                fill = false;
            }

            if (arguments.length < 4) {
                height = this.height();
            }

            if (arguments.length < 3) {
                width = this.width();
            }

            if (arguments.length < 2) {
                y = 0;
            }

            if (arguments.length < 1) {
                x = 0;
            }

            if (fill === false) {
                this.context.strokeText(text, x, y, maxWidth);
            } else {
                this.context.fillText(text, x, y, maxWidth);
            }
        }),
        createImageData: (function (width, height) {
            if (arguments.length < 2) {
                height = this.height();
            }

            if (arguments.length < 1) {
                width = this.width();
            }

            return this.imageData = this.context.createImageData(width, height);
        }),
        getImageData: (function (x, y, width, height) {
            if (arguments.length < 4) {
                height = this.height();
            }

            if (arguments.length < 3) {
                width = this.width();
            }

            if (arguments.length < 2) {
                y = 0;
            }

            if (arguments.length < 1) {
                x = 0;
            }

            return this.imageData = this.context.getImageData(x, y, width, height);
        }),
        setImageData: (function (width, height, data) {
            var _imageData = this.context.createImageData(width, height);

            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    for (var b = 0; b < 4; b++) {
                        var coord = ((y * height) + (x * 4)) + b;

                        _imageData[coord] = data[coord];
                    }
                }
            }

            this.imageData = _imageData;
        }),
        setRawImageData: (function (data) {
            this.imageData = data;
        }),
        putImageData: (function (x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight, data) {
            if (arguments.length < 6) {
                dirtyHeight = this.height();
            }

            if (arguments.length < 5) {
                dirtyWidth = this.width();
            }

            if (arguments.length < 4) {
                dirtyY = 0;
            }

            if (arguments.length < 3) {
                dirtyX = 0;
            }

            if (arguments.length < 2) {
                y = 0;
            }

            if (arguments.length < 1) {
                x = 0;
            }

            this.context.putImageData(data || this.imageData, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
        }),
        beginPath: (function (cfg) {
            this.context.beginPath();

            if (cfg) {
                if (cfg.lineWidth) {
                    this.context.lineWidth = cfg.lineWidth;
                }

                if (cfg.strokeStyle) {
                    this.context.strokeStyle = cfg.strokeStyle;
                }
            }
        }),
        drawImage: (function (imgElement, x, y, width, height, sx, sy, swidth, sheight) {
            if (arguments.length < 3) {
                y = 0;
            }

            if (arguments.length < 2) {
                x = 0;
            }

            if (arguments.length < 1) {
                return;
            }

            var type = typeof imgElement;

            switch (type) {
                case 'string':
                    imgElement = $(''.concat(imgElement[0] === '#' ? '' : '#', imgElement.trim()));

                    if (!imgElement.length) {
                        return;
                    }

                    imgElement = imgElement.get(0);

                    break;
                case 'array':
                    canvasElement = canvasElement.get(0);

                    break;
            }

            if (imgElement && x !== undefined && y !== undefined) {
                if (width !== undefined && height !== undefined) {
                    if (sx !== undefined && sy !== undefined && swidth !== undefined && sheight !== undefined) {
                        this.context.drawImage(imgElement, sx, sy, swidth, sheight, x, y, width, height);
                    } else {
                        this.context.drawImage(imgElement, x, y, width, height);
                    }
                } else {
                    this.context.drawImage(imgElement, x, y);
                }
            }
        }),
        moveTo: (function (x, y) {
            if (arguments.length < 1) {
                return;
            }

            this.context.beginPath();

            this.context.moveTo(x, y);
        }),
        lineTo: (function (x, y) {
            if (arguments.length < 1) {
                return;
            }

            this.context.lineTo(x, y);
        }),
        quadraticCurveTo: (function (x1, y1, x2, y2) {
            if (arguments.length < 4) {
                return;
            }

            this.context.quadraticCurveTo(x1, y1, x2, y2);
        }),
        stroke: (function () {
            this.imageData = null;

            this.context.stroke();
        }),
        scale: (function (width, height) {
            this.context.scale(width, height);
        }),
        clearRect: (function (width, height, x, y) {
            if (arguments.length < 2) {
                height = this.height();
            }

            if (arguments.length < 1) {
                width = this.width();
            }

            this.imageData = null;

            this.context.clearRect(x || 0, y || 0, width, height);
        }),
        rect: (function (x, y, width, height) {
            if (arguments.length < 4) {
                height = this.height();
            }

            if (arguments.length < 3) {
                width = this.width();
            }

            if (arguments.length < 2) {
                y = 0;
            }

            if (arguments.length < 1) {
                x = 0;
            }

            this.context.rect(x, y, width, height);
        }),
        fill: (function () {
            this.imageData = null;

            this.context.fill();
        }),
        /* End Wrapper Apis */
    };

    return CanvasNode;
}]);
