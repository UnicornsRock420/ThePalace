angular.module('ThePalace').controller('effectOptionsDialogController', ['$scope', '$window', 'model', 'CanvasNode', function ($scope, $window, model, CanvasNode) {
    $scope.model = model;
    $scope.fxCanvas = fx.canvas();
    $scope.texture = $scope.fxCanvas.texture(model.canvas.canvas);
    $scope.yCoord = $window.parseInt(model.canvas.height() / 2);
    $scope.xCoord = $window.parseInt(model.canvas.width() / 2);

    /*
    Copyright (c) 2011 Mario Klingemann
    Version: 	0.5
    Author:		Mario Klingemann
    Contact: 	mario@quasimondo.com
    Website:	http://www.quasimondo.com/BoxBlurForCanvas
    Or support me on flattr: https://flattr.com/thing/140066/Superfast-Blur-a-pretty-fast-Box-Blur-Effect-for-CanvasJavascript
    Twitter:	@quasimondo
    */
    var mul_table = [1, 57, 41, 21, 203, 34, 97, 73, 227, 91, 149, 62, 105, 45, 39, 137, 241, 107, 3, 173, 39, 71, 65, 238, 219, 101, 187, 87, 81, 151, 141, 133, 249, 117, 221, 209, 197, 187, 177, 169, 5, 153, 73, 139, 133, 127, 243, 233, 223, 107, 103, 99, 191, 23, 177, 171, 165, 159, 77, 149, 9, 139, 135, 131, 253, 245, 119, 231, 224, 109, 211, 103, 25, 195, 189, 23, 45, 175, 171, 83, 81, 79, 155, 151, 147, 9, 141, 137, 67, 131, 129, 251, 123, 30, 235, 115, 113, 221, 217, 53, 13, 51, 50, 49, 193, 189, 185, 91, 179, 175, 43, 169, 83, 163, 5, 79, 155, 19, 75, 147, 145, 143, 35, 69, 17, 67, 33, 65, 255, 251, 247, 243, 239, 59, 29, 229, 113, 111, 219, 27, 213, 105, 207, 51, 201, 199, 49, 193, 191, 47, 93, 183, 181, 179, 11, 87, 43, 85, 167, 165, 163, 161, 159, 157, 155, 77, 19, 75, 37, 73, 145, 143, 141, 35, 138, 137, 135, 67, 33, 131, 129, 255, 63, 250, 247, 61, 121, 239, 237, 117, 29, 229, 227, 225, 111, 55, 109, 216, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 48, 190, 47, 93, 185, 183, 181, 179, 178, 176, 175, 173, 171, 85, 21, 167, 165, 41, 163, 161, 5, 79, 157, 78, 154, 153, 19, 75, 149, 74, 147, 73, 144, 143, 71, 141, 140, 139, 137, 17, 135, 134, 133, 66, 131, 65, 129, 1];
    var shg_table = [0, 9, 10, 10, 14, 12, 14, 14, 16, 15, 16, 15, 16, 15, 15, 17, 18, 17, 12, 18, 16, 17, 17, 19, 19, 18, 19, 18, 18, 19, 19, 19, 20, 19, 20, 20, 20, 20, 20, 20, 15, 20, 19, 20, 20, 20, 21, 21, 21, 20, 20, 20, 21, 18, 21, 21, 21, 21, 20, 21, 17, 21, 21, 21, 22, 22, 21, 22, 22, 21, 22, 21, 19, 22, 22, 19, 20, 22, 22, 21, 21, 21, 22, 22, 22, 18, 22, 22, 21, 22, 22, 23, 22, 20, 23, 22, 22, 23, 23, 21, 19, 21, 21, 21, 23, 23, 23, 22, 23, 23, 21, 23, 22, 23, 18, 22, 23, 20, 22, 23, 23, 23, 21, 22, 20, 22, 21, 22, 24, 24, 24, 24, 24, 22, 21, 24, 23, 23, 24, 21, 24, 23, 24, 22, 24, 24, 22, 24, 24, 22, 23, 24, 24, 24, 20, 23, 22, 23, 24, 24, 24, 24, 24, 24, 24, 23, 21, 23, 22, 23, 24, 24, 24, 22, 24, 24, 24, 23, 22, 24, 24, 25, 23, 25, 25, 23, 24, 25, 25, 24, 22, 25, 25, 25, 24, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 23, 25, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 24, 22, 25, 25, 23, 25, 25, 20, 24, 25, 24, 25, 25, 22, 24, 25, 24, 25, 24, 25, 25, 24, 25, 25, 25, 25, 22, 25, 25, 25, 24, 25, 24, 25, 18];
    var boxBlurCanvasRGBA = (function (canvas, top_x, top_y, width, height, radius, iterations) {
        var context = canvas.context;
        var imageData = context.getImageData(top_x, top_y, width, height);
        var pixels = imageData.data;

        var rsum, gsum, bsum, asum, x, y, i, p, p1, p2, yp, yi, yw, idx, pa;
        var wm = width - 1;
        var hm = height - 1;
        var wh = width * height;
        var rad1 = radius + 1;

        var mul_sum = mul_table[radius];
        var shg_sum = shg_table[radius];

        var r = [];
        var g = [];
        var b = [];
        var a = [];

        var vmin = [];
        var vmax = [];

        while (iterations-- > 0) {
            yw = yi = 0;

            for (y = 0; y < height; y++) {
                rsum = pixels[yw] * rad1;
                gsum = pixels[yw + 1] * rad1;
                bsum = pixels[yw + 2] * rad1;
                asum = pixels[yw + 3] * rad1;

                for (i = 1; i <= radius; i++) {
                    p = yw + (((i > wm ? wm : i)) << 2);
                    rsum += pixels[p++];
                    gsum += pixels[p++];
                    bsum += pixels[p++];
                    asum += pixels[p]
                }

                for (x = 0; x < width; x++) {
                    r[yi] = rsum;
                    g[yi] = gsum;
                    b[yi] = bsum;
                    a[yi] = asum;

                    if (y == 0) {
                        vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
                        vmax[x] = ((p = x - radius) > 0 ? p << 2 : 0);
                    }

                    p1 = yw + vmin[x];
                    p2 = yw + vmax[x];

                    rsum += pixels[p1++] - pixels[p2++];
                    gsum += pixels[p1++] - pixels[p2++];
                    bsum += pixels[p1++] - pixels[p2++];
                    asum += pixels[p1] - pixels[p2];

                    yi++;
                }
                yw += (width << 2);
            }

            for (x = 0; x < width; x++) {
                yp = x;
                rsum = r[yp] * rad1;
                gsum = g[yp] * rad1;
                bsum = b[yp] * rad1;
                asum = a[yp] * rad1;

                for (i = 1; i <= radius; i++) {
                    yp += (i > hm ? 0 : width);
                    rsum += r[yp];
                    gsum += g[yp];
                    bsum += b[yp];
                    asum += a[yp];
                }

                yi = x << 2;

                for (y = 0; y < height; y++) {
                    pixels[yi + 3] = pa = (asum * mul_sum) >>> shg_sum;

                    if (pa > 0) {
                        pa = 255 / pa;
                        pixels[yi] = ((rsum * mul_sum) >>> shg_sum) * pa;
                        pixels[yi + 1] = ((gsum * mul_sum) >>> shg_sum) * pa;
                        pixels[yi + 2] = ((bsum * mul_sum) >>> shg_sum) * pa;
                    } else {
                        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
                    }

                    if (x == 0) {
                        vmin[y] = ((p = y + rad1) < hm ? p : hm) * width;
                        vmax[y] = ((p = y - radius) > 0 ? p * width : 0);
                    }

                    p1 = x + vmin[y];
                    p2 = x + vmax[y];

                    rsum += r[p1] - r[p2];
                    gsum += g[p1] - g[p2];
                    bsum += b[p1] - b[p2];
                    asum += a[p1] - a[p2];

                    yi += width << 2;
                }
            }
        }

        context.putImageData(imageData, top_x, top_y);
    });

    $scope.EffectOptions_OnInit = (function () {
        $scope.canvas = new CanvasNode('2d', angular.element('div.effectoptionsdialog div.modalbody canvas.demo'));
        $scope.canvas.height($scope.model.canvas.height());
        $scope.canvas.width($scope.model.canvas.width());

        $scope.overlay = new CanvasNode('2d', angular.element('div.effectoptionsdialog div.modalbody canvas.overlay'));
        $scope.overlay.height($scope.model.canvas.height());
        $scope.overlay.width($scope.model.canvas.width());

        switch ($scope.model.effect) {
            case 'EFFECTS_BASICBLURIMAGE':
                $scope.radius = angular.element('div.effectoptionsdialog div.modalbody div.radius').slider({
                    min: 0,
                    max: 100,
                    value: 25,
                }).on('slidechange', function ($event, ui) {
                    var radius = $window.parseInt($scope.radius.slider('option', 'value'));

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage(model.canvas.canvas, 0, 0);

                    boxBlurCanvasRGBA($scope.canvas, 0, 0, $scope.canvas.width(), $scope.canvas.height(), radius, 1);
                });

                $scope.radius.trigger('slidechange');

                break;
            case 'EFFECTS_ZOOMBLUR':
                $scope.strength = angular.element('div.effectoptionsdialog div.modalbody div.strength').slider({
                    min: 0,
                    max: 100,
                    value: 25,
                }).on('slidechange', function ($event, ui) {
                    var strength = $window.parseFloat($scope.strength.slider('option', 'value')) / 100;

                    $scope.fxCanvas.draw($scope.texture).zoomBlur($scope.xCoord, $scope.yCoord, strength).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                });

                $scope.strength.trigger('slidechange');

                break;
            case 'EFFECTS_INK':
                $scope.strength = angular.element('div.effectoptionsdialog div.modalbody div.strength').slider({
                    min: 0,
                    max: 100,
                    value: 25,
                }).on('slidechange', function ($event, ui) {
                    var strength = $window.parseFloat($scope.strength.slider('option', 'value')) / 100;

                    $scope.fxCanvas.draw($scope.texture).ink(strength).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                });

                $scope.strength.trigger('slidechange');

                break;
            case 'EFFECTS_DENOISE':
                $scope.exponent = angular.element('div.effectoptionsdialog div.modalbody div.exponent').slider({
                    min: 0,
                    max: 50,
                    value: 15,
                }).on('slidechange', function ($event, ui) {
                    var exponent = $window.parseInt($scope.exponent.slider('option', 'value'));

                    $scope.fxCanvas.draw($scope.texture).denoise(exponent).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                });

                $scope.exponent.trigger('slidechange');

                break;
            case 'EFFECTS_HEXAGONALPIXELATE':
                $scope.scale = angular.element('div.effectoptionsdialog div.modalbody div.scale').slider({
                    min: 10,
                    max: 100,
                    value: 25,
                }).on('slidechange', function ($event, ui) {
                    var scale = $window.parseInt($scope.scale.slider('option', 'value'));

                    $scope.fxCanvas.draw($scope.texture).hexagonalPixelate($scope.xCoord, $scope.yCoord, scale).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                });

                $scope.scale.trigger('slidechange');

                break;
            case 'EFFECTS_NOISE':
                $scope.amount = angular.element('div.effectoptionsdialog div.modalbody div.amount').slider({
                    min: 0,
                    max: 100,
                    value: 25,
                }).on('slidechange', function ($event, ui) {
                    var amount = $window.parseFloat($scope.amount.slider('option', 'value')) / 100;

                    $scope.fxCanvas.draw($scope.texture).noise(amount).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                });

                $scope.amount.trigger('slidechange');

                break;
            case 'EFFECTS_VIBRANCE':
                $scope.amount = angular.element('div.effectoptionsdialog div.modalbody div.amount').slider({
                    min: -100,
                    max: 100,
                    value: 25,
                }).on('slidechange', function ($event, ui) {
                    var amount = $window.parseFloat($scope.amount.slider('option', 'value')) / 100;

                    $scope.fxCanvas.draw($scope.texture).vibrance(amount).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                });

                $scope.amount.trigger('slidechange');

                break
            case 'EFFECTS_SEPIA':
                $scope.amount = angular.element('div.effectoptionsdialog div.modalbody div.amount').slider({
                    min: 0,
                    max: 100,
                    value: 100,
                }).on('slidechange', function ($event, ui) {
                    var amount = $window.parseFloat($scope.amount.slider('option', 'value')) / 100;

                    $scope.fxCanvas.draw($scope.texture).sepia(amount).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                });

                $scope.amount.trigger('slidechange');

                break;
            case 'EFFECTS_SWIRL':
                var slideChangeEvent = function ($event, ui) {
                    var angle = $window.parseFloat($scope.angle.slider('option', 'value'));
                    var radius = $window.parseInt($scope.radius.slider('option', 'value'));

                    $scope.fxCanvas.draw($scope.texture).swirl($scope.xCoord, $scope.yCoord, radius, angle).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                };

                $scope.angle = angular.element('div.effectoptionsdialog div.modalbody div.angle').slider({
                    min: -25,
                    max: 25,
                    value: 3,
                }).on('slidechange', slideChangeEvent);

                $scope.radius = angular.element('div.effectoptionsdialog div.modalbody div.radius').slider({
                    min: 0,
                    max: 600,
                    value: 200,
                }).on('slidechange', slideChangeEvent);

                $scope.radius.trigger('slidechange');

                break;
            case 'EFFECTS_VIGNETTE':
                var slideChangeEvent = function ($event, ui) {
                    var size = $window.parseFloat($scope.size.slider('option', 'value')) / 100;
                    var amount = $window.parseFloat($scope.amount.slider('option', 'value')) / 100;

                    $scope.fxCanvas.draw($scope.texture).vignette(size, amount).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                };

                $scope.size = angular.element('div.effectoptionsdialog div.modalbody div.size').slider({
                    min: 0,
                    max: 100,
                    value: 50,
                }).on('slidechange', slideChangeEvent);

                $scope.amount = angular.element('div.effectoptionsdialog div.modalbody div.amount').slider({
                    min: 0,
                    max: 100,
                    value: 20,
                }).on('slidechange', slideChangeEvent);

                $scope.amount.trigger('slidechange');

                break;
            case 'EFFECTS_UNSHARPMASK':
                var slideChangeEvent = function ($event, ui) {
                    var radius = $window.parseInt($scope.radius.slider('option', 'value'));
                    var strength = $window.parseFloat($scope.strength.slider('option', 'value')) / 100;

                    $scope.fxCanvas.draw($scope.texture).unsharpMask(radius, strength).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                };

                $scope.radius = angular.element('div.effectoptionsdialog div.modalbody div.radius').slider({
                    min: 0,
                    max: 200,
                    value: 50,
                }).on('slidechange', slideChangeEvent);

                $scope.strength = angular.element('div.effectoptionsdialog div.modalbody div.strength').slider({
                    min: 0,
                    max: 500,
                    value: 200,
                }).on('slidechange', slideChangeEvent);

                $scope.strength.trigger('slidechange');

                break;
            case 'EFFECTS_BNC':
                var slideChangeEvent = function ($event, ui) {
                    var brightness = $window.parseFloat($scope.brightness.slider('option', 'value')) / 100;
                    var contrast = $window.parseFloat($scope.contrast.slider('option', 'value')) / 100;

                    $scope.fxCanvas.draw($scope.texture).brightnessContrast(brightness, contrast).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                };

                $scope.brightness = angular.element('div.effectoptionsdialog div.modalbody div.brightness').slider({
                    min: -100,
                    max: 100,
                    value: 0,
                }).on('slidechange', slideChangeEvent);

                $scope.contrast = angular.element('div.effectoptionsdialog div.modalbody div.contrast').slider({
                    min: -100,
                    max: 100,
                    value: 0,
                }).on('slidechange', slideChangeEvent);

                $scope.contrast.trigger('slidechange');

                break;
            case 'EFFECTS_HNS':
                var slideChangeEvent = function ($event, ui) {
                    var hue = $window.parseFloat($scope.hue.slider('option', 'value')) / 100;
                    var saturation = $window.parseFloat($scope.saturation.slider('option', 'value')) / 100;

                    $scope.fxCanvas.draw($scope.texture).hueSaturation(hue, saturation).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                };

                $scope.hue = angular.element('div.effectoptionsdialog div.modalbody div.hue').slider({
                    min: -100,
                    max: 100,
                    value: 0,
                }).on('slidechange', slideChangeEvent);

                $scope.saturation = angular.element('div.effectoptionsdialog div.modalbody div.saturation').slider({
                    min: -100,
                    max: 100,
                    value: 0,
                }).on('slidechange', slideChangeEvent);

                $scope.saturation.trigger('slidechange');

                break;
            case 'EFFECTS_LENSBLUR':
                var slideChangeEvent = function ($event, ui) {
                    var radius = $window.parseInt($scope.radius.slider('option', 'value'));
                    var brightness = $window.parseFloat($scope.brightness.slider('option', 'value')) / 100;
                    var angle = $window.parseInt($scope.angle.slider('option', 'value')) / 100;

                    $scope.fxCanvas.draw($scope.texture).lensBlur(radius, brightness, angle).update();

                    $scope.canvas.clearRect();
                    $scope.canvas.drawImage($scope.fxCanvas, 0, 0);
                };

                $scope.radius = angular.element('div.effectoptionsdialog div.modalbody div.radius').slider({
                    min: 0,
                    max: 50,
                    value: 5,
                }).on('slidechange', slideChangeEvent);

                $scope.brightness = angular.element('div.effectoptionsdialog div.modalbody div.brightness').slider({
                    min: -100,
                    max: 100,
                    value: 0,
                }).on('slidechange', slideChangeEvent);

                $scope.angle = angular.element('div.effectoptionsdialog div.modalbody div.angle').slider({
                    min: -Math.PI * 100,
                    max: Math.PI * 100,
                    value: 0,
                }).on('slidechange', slideChangeEvent);

                $scope.angle.trigger('slidechange');

                break;
        }
    });

    $scope.Overlay_MouseMove = (function ($event) {
        if ($event.originalEvent.buttons === 1) {
            switch ($scope.model.effect) {
                case 'EFFECTS_HEXAGONALPIXELATE':
                    var windowElement = angular.element($window);
                    var overlay = angular.element('div.effectoptionsdialog canvas.overlay');
                    var yCoord = ($event.originalEvent.clientY - overlay.offset().top) + windowElement.scrollTop();
                    var xCoord = ($event.originalEvent.clientX - overlay.offset().left) + windowElement.scrollLeft();

                    $scope.yCoord = yCoord;
                    $scope.xCoord = xCoord;

                    $scope.scale.trigger('slidechange');

                    break;
                case 'EFFECTS_ZOOMBLUR':
                    var windowElement = angular.element($window);
                    var overlay = angular.element('div.effectoptionsdialog canvas.overlay');
                    var yCoord = ($event.originalEvent.clientY - overlay.offset().top) + windowElement.scrollTop();
                    var xCoord = ($event.originalEvent.clientX - overlay.offset().left) + windowElement.scrollLeft();

                    $scope.yCoord = yCoord;
                    $scope.xCoord = xCoord;

                    $scope.strength.trigger('slidechange');

                    break;
                case 'EFFECTS_SWIRL':
                    var windowElement = angular.element($window);
                    var overlay = angular.element('div.effectoptionsdialog canvas.overlay');
                    var yCoord = ($event.originalEvent.clientY - overlay.offset().top) + windowElement.scrollTop();
                    var xCoord = ($event.originalEvent.clientX - overlay.offset().left) + windowElement.scrollLeft();

                    $scope.yCoord = yCoord;
                    $scope.xCoord = xCoord;

                    $scope.radius.trigger('slidechange');

                    break;
            }
        }
    });

    $scope.Save_OnClick = (function ($event) {
        $scope.$close({
            canvas: $scope.canvas.canvas,
        });
    });
}]);
