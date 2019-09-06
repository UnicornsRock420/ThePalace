angular.module('ThePalace').controller('propEditorDialogController', ['$scope', '$window', '$timeout', 'model', 'dialogService', 'utilService', 'ImageObject', 'CanvasNode', function ($scope, $window, $timeout, model, dialogService, utilService, ImageObject, CanvasNode) {
    $scope.model = model;
    $scope.fileList = [];
    $scope.toolbar = [{
        name: 'Pencil',
        icon: 'tool-pencil.png',
        cursor: 'tool-pencil.ico',
        options: {
            size: 10,
            shape: 'round',
            shape_choices: [{ value: 'round', label: 'Round' }, { value: 'square', label: 'Square' }],
        },
    }, {
        name: 'Eraser',
        icon: 'tool-eraser.png',
        cursor: 'tool-eraser.ico',
        options: {
            size: 10,
            shape: 'round',
            shape_choices: [{ value: 'round', label: 'Round' }, { value: 'square', label: 'Square' }],
        },
    }, {
        name: 'Move',
        icon: 'tool-move.png',
        cursor: 'tool-move.ico',
        options: {},
    }, {
        name: 'Color Picker',
        icon: 'tool-color-picker.png',
        cursor: 'tool-color-picker.ico',
        options: {},
    }, {
        name: 'Bucket Fill',
        icon: 'tool-bucket-fill.png',
        cursor: 'tool-bucket-fill.ico',
        options: {
            tolerance: 0.3,
        },
    }, {
        name: 'Airbrush',
        icon: 'tool-airbrush.png',
        cursor: 'tool-airbrush.ico',
        options: {
            size: 10,
            opacity: 0.5,
        },
    }, {
        name: 'Blur',
        icon: 'tool-blur.png',
        cursor: 'tool-blur.ico',
        options: {
            size: 10,
            radius: 5,
            iterations: 1,
        },
    }, {
        name: 'Clone',
        icon: 'tool-clone.png',
        cursor: 'tool-clone.ico',
        options: {
            size: 10,
        },
    }, {
        name: 'Gradient',
        icon: 'tool-gradient.png',
        cursor: 'tool-gradient.ico',
        options: {
            radius: 0,
        },
    }, {
        name: 'Zoom',
        icon: 'tool-zoom.png',
        cursor: 'tool-zoom.ico',
        options: {},
    }, {
        name: 'Crop',
        icon: 'tool-crop.png',
        cursor: 'tool-crop.ico',
        options: {},
    }, {
        name: 'Rectangle Select',
        icon: 'tool-rect-select.png',
        cursor: 'tool-rect-select.ico',
        options: {},
    }, {
        name: 'Ellipse Select',
        icon: 'tool-ellipse-select.png',
        cursor: 'tool-ellipse-select.ico',
        options: {},
    }, {
        name: 'Text',
        icon: 'tool-text.png',
        cursor: 'tool-text.ico',
        options: {
            size: 30,
            lineWidth: 1,
            font: 'arial',
            font_choices: [
                { value: 'arial', label: 'Arial' },
                { value: 'fantasy', label: 'Fantasy' },
                { value: 'georgia', label: 'Georgia' },
                { value: 'helvetica', label: 'Helvetica' },
                { value: 'monospace', label: 'Monospace' },
                { value: 'sans-serif', label: 'Sans-Serif' },
                { value: 'serif', label: 'Serif' },
                { value: 'times', label: 'Times N.R.' },
                { value: 'verdana', label: 'Verdana' },
            ],
        },
    }];
    $scope.shiftKey = false;
    $scope.ctrlKey = false;
    $scope.altKey = false;
    $scope.mouseButtonId = 0;
    $scope.selectedTool = $scope.toolbar[0];
    $scope.selectedFile = null;
    $scope.clipboard = null;
    $scope.fgcolor = [255, 255, 255];
    $scope.bgcolor = [0, 0, 0];

    $scope.fxCanvas = fx.canvas();

    var windowElement = angular.element($window);
    var PI2 = Math.PI * 2;

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

    var distanceBetween = (function (point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    });

    var angleBetween = (function (point1, point2) {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    });

    var clearSelection = (function (file) {
        file.editor.activeLayer.context.globalCompositeOperation = 'destination-out';
        file.editor.activeLayer.context.beginPath();

        file.editor.activeLayer.moveTo(file.selectionmask.vortexes[0].h, file.selectionmask.vortexes[0].v);

        for (var j = file.selectionmask.vortexes.length - 1; j >= 0; j--) {
            var vortex = file.selectionmask.vortexes[j];

            file.editor.activeLayer.lineTo(vortex.h, vortex.v);
        }

        file.editor.activeLayer.context.fill();
        file.editor.activeLayer.context.globalCompositeOperation = 'source-over';
    });

    var getHistoryLayers = (function (layerId) {
        var file = $scope.selectedFile;
        var layers = [];

        for (var j = 0; j < file.editor.layers.length; j++) {
            if (!layerId || layerId === file.editor.layers[j].layerId) {
                var layer = {
                    position: j,
                    name: file.editor.layers[j].name,
                    layerId: file.editor.layers[j].layerId,
                    visible: file.editor.layers[j].visible,
                    image: new ImageObject({
                        sourceUrl: file.editor.layers[j].toDataURL(),
                    }),
                };
                layer.image.load();
                layers.push(layer);

                if (layerId) break;
            }
        }

        return layers;
    });

    var transparentPattern = null;

    $scope.Dialog_OnInit = (function () {
        var toolbox = angular.element('div#toolbox');
        var history = angular.element('div#history');
        var layers = angular.element('div#layers');
        var controls = [toolbox, history, layers];

        var sHeight = windowElement.height();
        var sWidth = windowElement.width();

        for (var j = 0; j < controls.length; j++) {
            var point = $window.localStorage.getObject(controls[j].attr('id') + '-position') || { v: 0, h: 0 };
            var y = $window.parseInt(point && point.v || 0);
            var x = $window.parseInt(point && point.h || 0);

            if (isNaN(y)) y = 0;
            if (isNaN(x)) x = 0;

            if (y > sHeight) y = 0;
            if (x > sWidth) x = 0;

            controls[j].css({
                top: y + 'px',
                left: x + 'px',
            });
        }
    });

    $scope.FileOpen_OnInit = (function (file) {
        $timeout(function () {
            var fileName = file.name.substring(0, file.name.indexOf('.'));

            $scope.selectedFile = file;

            file.editor = {
                layers: [],
                activeIndex: -1,
                activeLayer: null,
            };

            var layer = new CanvasNode('2d');
            layer.height(file.image.height);
            layer.width(file.image.width);
            layer.clearRect();
            layer.layerId = utilService.createUID();
            layer.name = 'Background Layer';
            layer.visible = true;

            file.editor.activeLayer = layer;
            file.editor.layers.push(layer);
            file.editor.activeIndex = file.editor.layers.length - 1;

            file.historyEvents = [];
            file.historyEvents.push({
                layers: [{
                    image: file.image,
                    layerId: layer.layerId,
                    visible: true,
                }],
                height: file.image.height,
                width: file.image.width,
                label: 'Opened File',
            });
            file.redoEvents = [];

            var display = angular.element('div.propeditordialog div#' + fileName + ' canvas.display');
            if (display.length > 0) {
                file.display = new CanvasNode('2d', display);
                file.display.height(file.image.height);
                file.display.width(file.image.width);
                file.display.scale = 1;

                var transparentTileImage = new ImageObject({
                    sourceUrl: '/images/ui/transparent.png',
                    resolve: function () {
                        transparentPattern = file.display.context.createPattern(this.image, 'repeat');
                    },
                });
                transparentTileImage.load();
            }

            var selectionmask = angular.element('div.propeditordialog div#' + fileName + ' canvas.selectionmask');
            if (selectionmask.length > 0) {
                file.selectionmask = new CanvasNode('2d', selectionmask);
                file.selectionmask.height(file.image.height);
                file.selectionmask.width(file.image.width);
                file.selectionmask.vortexes = [];
            }

            var cropmask = angular.element('div.propeditordialog div#' + fileName + ' canvas.cropmask');
            if (cropmask.length > 0) {
                file.cropmask = new CanvasNode('2d', cropmask);
                file.cropmask.height(file.image.height);
                file.cropmask.width(file.image.width);
            }

            var text = angular.element('div.propeditordialog div#' + fileName + ' canvas.text');
            if (text.length > 0) {
                file.text = new CanvasNode('2d', text);
                file.text.height(file.image.height);
                file.text.width(file.image.width);
                file.text.globalAlpha(0.5);
            }

            var cursor = angular.element('div.propeditordialog div#' + fileName + ' canvas.cursor');
            if (cursor.length > 0) {
                file.cursor = new CanvasNode('2d', cursor);
                file.cursor.height(file.image.height);
                file.cursor.width(file.image.width);
                file.cursor.globalAlpha(0.5);
            }

            var overlay = angular.element('div.propeditordialog div#' + fileName + ' canvas.overlay');
            if (overlay.length > 0) {
                overlay.on('contextmenu', function ($event) {
                    return false;
                });
                file.overlay = new CanvasNode('2d', overlay);
                file.overlay.height(file.image.height);
                file.overlay.width(file.image.width);
            }

            var fileContainer = angular.element('div.propeditordialog div#' + fileName);
            var yCoord = ((windowElement.height() / 2) - (fileContainer.height() / 2) - fileContainer.offset().top) + windowElement.scrollTop();
            var xCoord = ((windowElement.width() / 2) - (fileContainer.width() / 2) - fileContainer.offset().left) + windowElement.scrollLeft();
            fileContainer.css({
                top: yCoord + 'px',
                left: xCoord + 'px',
                height: file.image.height + 'px',
                width: file.image.width + 'px',
            });
            fileContainer.resizable({
                resize: function ($event, ui) {
                    var file = $scope.selectedFile;

                    if (file) {
                        var fileName = file.name.substring(0, file.name.indexOf('.'));
                        var fileContainer = angular.element('div.propeditordialog div#' + fileName);
                        var height = 100;
                        var width = 100;

                        if (!file.isMinimized && (fileContainer.width() < width || fileContainer.height() < height)) {
                            fileContainer.css({
                                height: height + 'px',
                                width: width + 'px',
                            });
                        }
                        else {
                            fileContainer.css({
                                height: (ui.size.height + 25) + 'px',
                                width: ui.size.width + 'px',
                            });
                        }
                    }
                },
            });

            fileContainer.find('div.ui-resizable-e, div.ui-resizable-s').remove();

            $scope.Redraw(true);
        }, 0);
    });

    $scope.FileButtons_OnClick = (function ($event, $index, file, mode) {
        var file = $scope.selectedFile;

        if (!file) return;

        var fileName = file.name.substring(0, file.name.indexOf('.'));
        var fileContainer = angular.element('div.propeditordialog div#' + fileName);

        switch (mode) {
            case 'CLOSE':
                if (file.isDirty) {
                    dialogService.yesNo('You have unsaved changes, are you sure?').then(function (response) {
                        if (response) {
                            $scope.fileList.splice($index, 1);

                            $scope.selectedFile = null;
                        }
                    }, function (errors) {
                    });
                } else {
                    $scope.fileList.splice($index, 1);

                    $scope.selectedFile = null;
                }

                break;
            case 'RESTORE':
                file.isMaximized = false;
                file.isMinimized = false;

                fileContainer.css({
                    top: file.restorePoint.v + 'px',
                    left: file.restorePoint.h + 'px',
                    height: file.restorePoint.height + 'px',
                    width: file.restorePoint.width + 'px',
                });

                break;
            case 'MIN':
                var rHeight = $window.parseInt(fileContainer.css('height'));
                var rWidth = $window.parseInt(fileContainer.css('width'));

                if (!file.isMaximized) {
                    var rYCoord = $window.parseInt(fileContainer.css('top'));
                    var rXCoord = $window.parseInt(fileContainer.css('left'));
                    file.restorePoint = { v: rYCoord, h: rXCoord, height: rHeight, width: rWidth, };
                }
                else {
                    if (rHeight < 100) rHeight = file.restorePoint.height;
                    if (rWidth < 100) rWidth = file.restorePoint.width;
                }

                var uiContainer = angular.element('div.propeditordialog div.modalbody');
                var yCoord = ((rHeight / 2) - uiContainer.offset().top) + windowElement.scrollTop();
                var xCoord = 40 - uiContainer.offset().left + windowElement.scrollLeft();
                fileContainer.css({
                    top: yCoord + 'px',
                    left: xCoord + 'px',
                    height: 40 + 'px',
                    width: 80 + 'px',
                });

                file.isMaximized = false;
                file.isMinimized = true;

                break;
            case 'MAX':
                var rHeight = $window.parseInt(fileContainer.css('height'));
                var rWidth = $window.parseInt(fileContainer.css('width'));

                if (!file.isMinimized) {
                    var rYCoord = $window.parseInt(fileContainer.css('top'));
                    var rXCoord = $window.parseInt(fileContainer.css('left'));
                    file.restorePoint = { v: rYCoord, h: rXCoord, height: rHeight, width: rWidth, };
                }
                else {
                    if (rHeight < 100) rHeight = file.restorePoint.height;
                    if (rWidth < 100) rWidth = file.restorePoint.width;
                }

                var uiContainer = angular.element('div.propeditordialog div.modalbody');
                var yCoord = ((rHeight / 2) - uiContainer.offset().top) + windowElement.scrollTop();
                var xCoord = 40 - uiContainer.offset().left + windowElement.scrollLeft();
                fileContainer.css({
                    top: yCoord + 'px',
                    left: xCoord + 'px',
                    height: (windowElement.height() - 40) + 'px',
                    width: (windowElement.width() - 40) + 'px',
                });

                file.isMaximized = true;
                file.isMinimized = false;

                break;
        }
    });

    $scope.ToolBar_OnClick = (function ($event, tool) {
        var file = $scope.selectedFile;

        file.text.clearRect();

        $scope.selectedTool = tool;

        switch ($scope.selectedTool.name) {
            case 'Gradient':
                $scope.selectedTool.options.prevYCoord = null;
                $scope.selectedTool.options.prevXCoord = null;

                file.editor.activeLayer.restore();

                break;
            case 'Rectangle Select':
            case 'Ellipse Select':
                file.editor.activeLayer.restore();
                file.editor.activeLayer.save();

                break;
            case 'Move':
                file.editor.activeLayer.restore();

                break;
            default:
                file.editor.tempCanvas = null;

                file.editor.activeLayer.restore();

                break;
        }
    });

    $scope.ToolOptions_OnChange = (function ($event, name) {
        var file = $scope.selectedFile;

        file.editor.tempCanvas = null;

        switch ($scope.selectedTool.name) {
            case 'Blur':
                var iterations = $window.parseInt($scope.selectedTool.options.iterations);
                var radius = $window.parseInt($scope.selectedTool.options.radius);
                var height = file.overlay.height();
                var width = file.overlay.width();

                file.editor.tempCanvas = new CanvasNode('2d');
                file.editor.tempCanvas.height(height);
                file.editor.tempCanvas.width(width);

                file.editor.tempCanvas.drawImage(file.editor.activeLayer.canvas, 0, 0, width, height);

                boxBlurCanvasRGBA(file.editor.tempCanvas, 0, 0, width, height, radius, iterations);

                break;
            case 'Text':
                $scope.Overlay_OnKeyDown();

                break;
        }
    });

    $scope.SelectFile_OnMouseEnter = (function ($event, file) {
        if (!$scope.selectedFile || $scope.selectedFile.name !== file.name) {
            $scope.selectedFile = file;

            $scope.Redraw();
        } else {
            $scope.selectedFile = file;
        }
    });

    $scope.BgColor_OnClick = (function ($event) {
        dialogService.colorPicker({
            color: $scope.bgcolor,
        }).then(function (response) {
            $scope.bgcolor = response.color;

            $scope.Overlay_OnKeyDown();
        }, function (errors) {
        });
    });

    $scope.FgColor_OnClick = (function ($event) {
        dialogService.colorPicker({
            color: $scope.fgcolor,
        }).then(function (response) {
            $scope.fgcolor = response.color;

            $scope.Overlay_OnKeyDown();
        }, function (errors) {
        });
    });

    $scope.Redraw = (function (restoreHistory) {
        var file = $scope.selectedFile;

        if (file) {
            if (restoreHistory && file.historyEvents && file.historyEvents.length > 0) {
                var historyEvent = null;

                if (restoreHistory === true) {
                    historyEvent = file.historyEvents[file.historyEvents.length - 1];
                }
                else {
                    historyEvent = restoreHistory;
                }

                if (historyEvent) {
                    for (var j = 0; j < file.editor.layers.length; j++) {
                        var layer = file.editor.layers[j];

                        if (layer.height() !== historyEvent.height) {
                            layer.height(historyEvent.height);
                        }

                        if (layer.width() !== historyEvent.width) {
                            layer.width(historyEvent.width);
                        }

                        for (var k = 0; k < historyEvent.layers.length; k++) {
                            if (historyEvent.layers[k].layerId === layer.layerId) {
                                layer.visible = historyEvent.layers[k].visible;
                                layer.clearRect();
                                layer.drawImage(historyEvent.layers[k].image.image, 0, 0);

                                break;
                            }
                        }
                    }

                    var frontLayers = ['display', 'selectionmask', 'cropmask', 'text', 'cursor', 'overlay'];
                    for (var j = 0; j < frontLayers.length; j++) {
                        file[frontLayers[j]].height(historyEvent.height);
                        file[frontLayers[j]].width(historyEvent.width);
                    }
                }
            }

            file.editor.activeLayer.restore();
            file.editor.activeLayer.save();

            if (!file.selectionmask.isDrawing) {
                file.selectionmask.clearRect();

                if (file.selectionmask.vortexes && file.selectionmask.vortexes.length > 0) {
                    file.selectionmask.strokeStyleRgba(255, 255, 255, 255);

                    file.selectionmask.beginPath();
                    file.editor.activeLayer.beginPath();

                    file.selectionmask.moveTo(file.selectionmask.vortexes[0].h, file.selectionmask.vortexes[0].v);
                    file.editor.activeLayer.moveTo(file.selectionmask.vortexes[0].h, file.selectionmask.vortexes[0].v);

                    for (var j = file.selectionmask.vortexes.length - 1; j >= 0; j--) {
                        var vortex = file.selectionmask.vortexes[j];

                        file.selectionmask.lineTo(vortex.h, vortex.v);
                        file.editor.activeLayer.lineTo(vortex.h, vortex.v);
                    }

                    file.selectionmask.stroke();
                    file.editor.activeLayer.context.clip();
                }

                var height = file.overlay.height();
                var width = file.overlay.width();

                file.display.clearRect();
                file.display.context.save();
                file.display.context.translate(width * 0.5, height * 0.5);
                file.display.context.scale(file.display.scale, file.display.scale);

                file.display.context.fillStyle = transparentPattern;
                file.display.context.rect(-width, -height, width * 2, height * 2);
                file.display.context.fill();

                for (var j = 0; j < file.editor.layers.length; j++) {
                    if (file.editor.layers[j].visible) {
                        file.display.context.drawImage(file.editor.layers[j].canvas, -width * 0.5, -height * 0.5);
                    }
                }
                file.display.context.restore();
            }
        }
    });

    $scope.Overlay_OnMouseDown = (function ($event, $index, file) {
        $event.preventDefault();
        $event.stopPropagation();

        var overlay = angular.element('div.propeditordialog div#' + file.name.substring(0, file.name.indexOf('.')) + ' canvas.overlay');
        var yCoord = $window.parseInt(($event.originalEvent.clientY - overlay.offset().top) + windowElement.scrollTop());
        var xCoord = $window.parseInt(($event.originalEvent.clientX - overlay.offset().left) + windowElement.scrollLeft());

        $scope.mouseButtonId = $event.originalEvent.buttons;

        switch ($scope.selectedTool.name) {
            case 'Text':
                if ($scope.mouseButtonId === 1) {
                    var size = $window.parseInt($scope.selectedTool.options.size);

                    file.text.lineWidth(1);
                    file.text.strokeStyleRgba(0, 0, 0, 255);

                    file.text.clearRect();
                    file.text.beginPath();
                    file.text.moveTo(xCoord, yCoord);
                    file.text.lineTo(xCoord, yCoord + size);
                    file.text.stroke();

                    $scope.selectedTool.options.prevYCoord = yCoord;
                    $scope.selectedTool.options.prevXCoord = xCoord;
                    $scope.selectedFile.text.buffer = '';
                }

                break;
            case 'Pencil':
                var color = null;

                if ($scope.mouseButtonId === 1) {
                    color = $scope.bgcolor;
                }
                else if ($scope.mouseButtonId === 2) {
                    color = $scope.fgcolor;
                }

                if (color) {
                    var size = $window.parseInt($scope.selectedTool.options.size);

                    file.editor.activeLayer.fillStyleRgba(color[1], color[2], color[0], 255);
                    file.editor.activeLayer.beginPath();

                    if ($scope.selectedTool.options.shape === 'square') {
                        file.editor.activeLayer.rect(xCoord - size, yCoord - size, size * 2, size * 2);
                    }
                    else if ($scope.selectedTool.options.shape === 'round') {
                        file.editor.activeLayer.arc(xCoord, yCoord, size, 0, PI2);
                    }

                    file.editor.activeLayer.fill();
                }

                break;
            case 'Eraser':
                if ($scope.mouseButtonId === 1) {
                    var size = $window.parseInt($scope.selectedTool.options.size);

                    file.editor.activeLayer.context.globalCompositeOperation = 'destination-out';
                    file.editor.activeLayer.context.beginPath();

                    if ($scope.selectedTool.options.shape === 'square') {
                        file.editor.activeLayer.rect(xCoord - size, yCoord - size, size * 2, size * 2);
                    }
                    else if ($scope.selectedTool.options.shape === 'round') {
                        file.editor.activeLayer.arc(xCoord, yCoord, size, 0, PI2);
                    }

                    file.editor.activeLayer.context.fill();
                    file.editor.activeLayer.context.globalCompositeOperation = 'source-over';
                }

                break;
            case 'Color Picker':
                var pixel = file.editor.activeLayer.getPixelData(xCoord, yCoord);

                if ($scope.mouseButtonId === 1) {
                    $scope.bgcolor = pixel;
                }
                else if ($scope.mouseButtonId === 2) {
                    $scope.fgcolor = pixel;
                }

                break;
            case 'Bucket Fill':
                var color = null;

                if ($scope.mouseButtonId === 1) {
                    color = $scope.bgcolor;
                }
                else if ($scope.mouseButtonId === 2) {
                    color = $scope.fgcolor;
                }

                if (color) {
                    function matchStartColor(pixelPos) {
                        var r = outlineData.data[pixelPos + 0],
                            g = outlineData.data[pixelPos + 1],
                            b = outlineData.data[pixelPos + 2],
                            a = outlineData.data[pixelPos + 3];

                        if ((r + g + b) < 1 && a === 255) {
                            return false;
                        }

                        var r = imageData.data[pixelPos + 0],
                            g = imageData.data[pixelPos + 1],
                            b = imageData.data[pixelPos + 2],
                            a = imageData.data[pixelPos + 3];

                        if (a === 0) {
                            return true;
                        }

                        if (r === color[1] && g === color[2] && b === color[0]) {
                            return false;
                        }

                        return ((r >= (startR - (startR * tolerance)) && (r <= (startR + (startR * tolerance)))) &&
                            (g >= (startG - (startG * tolerance)) && (g <= (startG + (startG * tolerance)))) &&
                            (b >= (startB - (startB * tolerance)) && (b <= (startB + (startB * tolerance)))));
                    }

                    function colorPixel(pixelPos) {
                        imageData.data[pixelPos + 0] = color[1];
                        imageData.data[pixelPos + 1] = color[2];
                        imageData.data[pixelPos + 2] = color[0];
                        imageData.data[pixelPos + 3] = 255;
                    }

                    var height = file.overlay.height();
                    var width = file.overlay.width();
                    var imageData = file.editor.activeLayer.getImageData(0, 0, width, height);
                    var tolerance = $window.parseFloat($scope.selectedTool.options.tolerance);

                    var tempCanvas = new CanvasNode('2d');
                    tempCanvas.height(height);
                    tempCanvas.width(width);
                    tempCanvas.lineWidth(1);
                    tempCanvas.strokeStyleRgba(0, 0, 0, 255);
                    tempCanvas.fillStyleRgba(255, 255, 255, 255);
                    tempCanvas.moveTo(0, 0);
                    tempCanvas.lineTo(width, 0);
                    tempCanvas.lineTo(width, height);
                    tempCanvas.lineTo(0, height);
                    tempCanvas.lineTo(0, 0);
                    tempCanvas.stroke();
                    tempCanvas.fill();
                    var outlineData = tempCanvas.getImageData(0, 0, width, height);

                    var startCoord = (xCoord + (yCoord * width)) * 4;
                    var startR = imageData.data[startCoord + 0];
                    var startG = imageData.data[startCoord + 1];
                    var startB = imageData.data[startCoord + 2];

                    var pixelStack = [[xCoord, yCoord]];

                    while (pixelStack.length) {
                        var newPos = pixelStack.pop();
                        var y = newPos[1];
                        var x = newPos[0];

                        var pixelPos = (y * width + x) * 4;
                        while (y-- >= 0 && matchStartColor(pixelPos)) {
                            pixelPos -= width * 4;
                        }

                        pixelPos += width * 4;
                        y++;

                        var reachLeft = false;
                        var reachRight = false;

                        while (y++ < height - 1 && matchStartColor(pixelPos)) {
                            colorPixel(pixelPos);

                            if (x > 0) {
                                if (matchStartColor(pixelPos - 4)) {
                                    if (!reachLeft) {
                                        pixelStack.push([x - 1, y]);
                                        reachLeft = true;
                                    }
                                }
                                else if (reachLeft) {
                                    reachLeft = false;
                                }
                            }

                            if (x < width - 1) {
                                if (matchStartColor(pixelPos + 4)) {
                                    if (!reachRight) {
                                        pixelStack.push([x + 1, y]);
                                        reachRight = true;
                                    }
                                }
                                else if (reachRight) {
                                    reachRight = false;
                                }
                            }

                            pixelPos += width * 4;
                        }
                    }

                    file.editor.tempCanvas = new CanvasNode('2d');
                    file.editor.tempCanvas.height(height);
                    file.editor.tempCanvas.width(width);
                    file.editor.tempCanvas.putImageData(0, 0, 0, 0, width, height, imageData);

                    file.editor.activeLayer.clearRect();
                    file.editor.activeLayer.drawImage(file.editor.tempCanvas.canvas, 0, 0, width, height, 0, 0, width, height);

                    file.editor.tempCanvas = null;
                }

                break;
            case 'Blur':
                if ($scope.mouseButtonId === 1 || $scope.mouseButtonId === 2) {
                    $scope.ToolOptions_OnChange($event, 'size');
                }

                break;
            case 'Zoom':
                var factor = 0;

                if ($scope.mouseButtonId === 1) {
                    factor = 0.25;
                }
                else if ($scope.mouseButtonId === 2) {
                    factor = -0.25;
                }

                if (factor !== 0) {
                    //file.editor.activeLayer.save();

                    file.display.scale += factor;
                }

                break;
            case 'Rectangle Select':
            case 'Ellipse Select':
            case 'Airbrush':
            case 'Crop':
                if ($scope.mouseButtonId === 1 || $scope.mouseButtonId === 2) {
                    $scope.selectedTool.options.prevYCoord = yCoord;
                    $scope.selectedTool.options.prevXCoord = xCoord;
                }

                break;
            case 'Gradient':
                if ($scope.mouseButtonId === 1) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord || 0);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord || 0);

                    if (prevXCoord && prevYCoord) {
                        var radius = $window.parseInt($scope.selectedTool.options.radius);
                        var y = prevYCoord < yCoord ? prevYCoord : yCoord;
                        var x = prevXCoord < xCoord ? prevXCoord : xCoord;
                        var height = Math.abs(yCoord - prevYCoord);
                        var width = Math.abs(xCoord - prevXCoord);
                        var colorStops = null;

                        if (radius === 0) {
                            colorStops = file.editor.activeLayer.context.createLinearGradient(prevXCoord, prevYCoord, xCoord, yCoord);
                        }
                        else {
                            colorStops = file.editor.activeLayer.context.createRadialGradient(prevXCoord, prevYCoord, radius, xCoord, yCoord, radius);
                        }

                        colorStops.addColorStop(0, 'rgba(' + $scope.bgcolor[1] + ',' + $scope.bgcolor[2] + ',' + $scope.bgcolor[0] + ', 255)');
                        colorStops.addColorStop(1, 'rgba(' + $scope.fgcolor[1] + ',' + $scope.fgcolor[2] + ',' + $scope.fgcolor[0] + ', 255)');

                        file.editor.activeLayer.context.fillStyle = colorStops;
                        file.editor.activeLayer.context.fillRect(x, y, width, height);

                        $scope.selectedTool.options.prevYCoord = null;
                        $scope.selectedTool.options.prevXCoord = null;
                    }
                    else {
                        $scope.selectedTool.options.prevYCoord = yCoord;
                        $scope.selectedTool.options.prevXCoord = xCoord;
                    }
                }

                break;
            case 'Move':
                if ($scope.mouseButtonId === 1) {
                    var height = file.overlay.height();
                    var width = file.overlay.width();

                    file.editor.tempCanvas = new CanvasNode('2d');
                    file.editor.tempCanvas.height(height);
                    file.editor.tempCanvas.width(width);
                    file.editor.tempCanvas.clearRect();
                    file.editor.tempCanvas.drawImage(file.editor.activeLayer.canvas, 0, 0, width, height);
                }

                break;
        }

        $scope.Redraw();
    });

    $scope.Overlay_OnMouseMove = (function ($event, $index, file) {
        $event.preventDefault();
        $event.stopPropagation();

        var overlay = angular.element('div.propeditordialog div#' + file.name.substring(0, file.name.indexOf('.')) + ' canvas.overlay');
        var yCoord = $window.parseInt(($event.originalEvent.clientY - overlay.offset().top) + windowElement.scrollTop());
        var xCoord = $window.parseInt(($event.originalEvent.clientX - overlay.offset().left) + windowElement.scrollLeft());

        $scope.mousePosY = yCoord;
        $scope.mousePosX = xCoord;

        file.cursor.clearRect();

        if ($scope.selectedTool && (['Gradient', 'Color Picker', 'Rectangle Select', 'Ellipse Select', 'Crop', 'Text', 'Bucket Fill', 'Move'].indexOf($scope.selectedTool.name) > -1 || $scope.selectedTool.options.size)) {
            var size = $window.parseInt($scope.selectedTool.options.size) || 10;

            switch ($scope.selectedTool.name) {
                case 'Text':
                    if ($scope.mouseButtonId === 1) {
                        var size = $window.parseInt($scope.selectedTool.options.size);

                        file.text.lineWidth(1);
                        file.text.strokeStyleRgba(0, 0, 0, 255);

                        file.text.clearRect();
                        file.text.beginPath();
                        file.text.moveTo(xCoord, yCoord);
                        file.text.lineTo(xCoord, yCoord + size);
                        file.text.stroke();

                        $scope.selectedTool.options.prevYCoord = yCoord;
                        $scope.selectedTool.options.prevXCoord = xCoord;
                    }

                    break;
                case 'Clone':
                    var offsetY = $window.parseInt($scope.selectedTool.options.offsetY);
                    var offsetX = $window.parseInt($scope.selectedTool.options.offsetX);

                    file.cursor.lineWidth(1);
                    file.cursor.strokeStyleRgba(255, 255, 255, 255);

                    file.cursor.beginPath();
                    file.cursor.arc(xCoord + offsetX, yCoord + offsetY, size, 0, PI2, false);
                    file.cursor.stroke();

                    break;
                case 'Gradient':
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);

                    if (prevXCoord > 0 && prevYCoord > 0) {
                        file.cursor.lineWidth(1);
                        file.cursor.strokeStyleRgba(255, 255, 255, 255);

                        file.cursor.beginPath();
                        file.cursor.arc(prevXCoord, prevYCoord, size, 0, PI2, false);
                        file.cursor.stroke();
                    }

                    break;
            }

            switch ($scope.selectedTool.name) {
                case 'Rectangle Select':
                case 'Ellipse Select':
                case 'Color Picker':
                case 'Bucket Fill':
                case 'Crop':
                case 'Move':
                    file.cursor.lineWidth(1);
                    file.cursor.strokeStyleRgba(0, 0, 0, 255);

                    file.cursor.beginPath();
                    file.cursor.moveTo(xCoord, yCoord - size, size, 0, PI2, false);
                    file.cursor.lineTo(xCoord, yCoord - 4, size, 0, PI2, false);
                    file.cursor.stroke();

                    file.cursor.beginPath();
                    file.cursor.moveTo(xCoord + size, yCoord, size, 0, PI2, false);
                    file.cursor.lineTo(xCoord + 4, yCoord, size, 0, PI2, false);
                    file.cursor.stroke();

                    file.cursor.beginPath();
                    file.cursor.moveTo(xCoord, yCoord + size, size, 0, PI2, false);
                    file.cursor.lineTo(xCoord, yCoord + 4, size, 0, PI2, false);
                    file.cursor.stroke();

                    file.cursor.beginPath();
                    file.cursor.moveTo(xCoord - size, yCoord, size, 0, PI2, false);
                    file.cursor.lineTo(xCoord - 4, yCoord, size, 0, PI2, false);
                    file.cursor.stroke();

                    file.cursor.beginPath();
                    file.cursor.arc(xCoord, yCoord, 1, 0, PI2, false);
                    file.cursor.stroke();

                    break;
                case 'Text':
                    file.cursor.lineWidth(1);
                    file.cursor.strokeStyleRgba(0, 0, 0, 255);

                    file.cursor.beginPath();
                    file.cursor.moveTo(xCoord, yCoord);
                    file.cursor.lineTo(xCoord, yCoord + size);
                    file.cursor.stroke();

                    break;
                default:
                    file.cursor.lineWidth(1);
                    file.cursor.strokeStyleRgba(0, 0, 0, 255);

                    file.cursor.beginPath();
                    file.cursor.arc(xCoord, yCoord, size, 0, PI2, false);
                    file.cursor.stroke();

                    break;
            }
        }

        switch ($scope.selectedTool.name) {
            case 'Pencil':
                var color = null;

                if ($scope.mouseButtonId === 1) {
                    color = $scope.bgcolor;
                }
                else if ($scope.mouseButtonId === 2) {
                    color = $scope.fgcolor;
                }

                if (color) {
                    var size = $window.parseInt($scope.selectedTool.options.size);

                    file.editor.activeLayer.fillStyleRgba(color[1], color[2], color[0], 255);
                    file.editor.activeLayer.beginPath();

                    if ($scope.selectedTool.options.shape === 'square') {
                        file.editor.activeLayer.rect(xCoord - size, yCoord - size, size * 2, size * 2);
                    }
                    else if ($scope.selectedTool.options.shape === 'round') {
                        file.editor.activeLayer.arc(xCoord, yCoord, size, 0, PI2);
                    }

                    file.editor.activeLayer.fill();
                }

                break;
            case 'Eraser':
                if ($scope.mouseButtonId === 1) {
                    var size = $window.parseInt($scope.selectedTool.options.size);

                    file.editor.activeLayer.context.globalCompositeOperation = 'destination-out';
                    file.editor.activeLayer.context.beginPath();

                    if ($scope.selectedTool.options.shape === 'square') {
                        file.editor.activeLayer.rect(xCoord - size, yCoord - size, size * 2, size * 2);
                    }
                    else if ($scope.selectedTool.options.shape === 'round') {
                        file.editor.activeLayer.arc(xCoord, yCoord, size, 0, PI2);
                    }

                    file.editor.activeLayer.context.fill();
                    file.editor.activeLayer.context.globalCompositeOperation = 'source-over';
                }

                break;
            case 'Color Picker':
                var pixel = file.editor.activeLayer.getPixelData(xCoord, yCoord);

                if ($scope.mouseButtonId === 1) {
                    $scope.bgcolor = pixel;
                }
                else if ($scope.mouseButtonId === 2) {
                    $scope.fgcolor = pixel;
                }

                break;
            case 'Move':
                if ($scope.mouseButtonId === 1) {
                    var height = file.overlay.height();
                    var width = file.overlay.width();

                    file.editor.activeLayer.clearRect();
                    file.editor.activeLayer.drawImage(file.editor.tempCanvas.canvas, xCoord - (width / 2), yCoord - (height / 2));
                }

                break;
            case 'Rectangle Select':
                if ($scope.mouseButtonId === 1 && $scope.selectedTool.options.prevXCoord && $scope.selectedTool.options.prevXCoord > 0 && $scope.selectedTool.options.prevYCoord && $scope.selectedTool.options.prevYCoord > 0) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);

                    file.selectionmask.strokeStyleRgba(255, 255, 255, 255);
                    file.selectionmask.clearRect();

                    if ($scope.shiftKey && file.selectionmask.vortexes && file.selectionmask.vortexes.length > 0) {
                        file.selectionmask.beginPath();

                        file.selectionmask.moveTo(file.selectionmask.vortexes[0].h, file.selectionmask.vortexes[0].v);

                        for (var j = file.selectionmask.vortexes.length - 1; j >= 0; j--) {
                            var vortex = file.selectionmask.vortexes[j];

                            file.selectionmask.lineTo(vortex.h, vortex.v);
                        }

                        file.selectionmask.stroke();
                    }

                    file.selectionmask.beginPath();
                    file.selectionmask.rect(prevXCoord, prevYCoord, xCoord - prevXCoord, yCoord - prevYCoord);
                    file.selectionmask.stroke();

                    file.selectionmask.isDrawing = true;
                }

                break;
            case 'Ellipse Select':
                if ($scope.mouseButtonId === 1 && $scope.selectedTool.options.prevXCoord && $scope.selectedTool.options.prevXCoord > 0 && $scope.selectedTool.options.prevYCoord && $scope.selectedTool.options.prevYCoord > 0) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);
                    var height = Math.abs(yCoord - prevYCoord);
                    var width = Math.abs(xCoord - prevXCoord);
                    var radius = width > height ? width : height;

                    file.selectionmask.strokeStyleRgba(255, 255, 255, 255);
                    file.selectionmask.clearRect();

                    if ($scope.shiftKey && file.selectionmask.vortexes && file.selectionmask.vortexes.length > 0) {
                        file.selectionmask.beginPath();

                        file.selectionmask.moveTo(file.selectionmask.vortexes[0].h, file.selectionmask.vortexes[0].v);

                        for (var j = file.selectionmask.vortexes.length - 1; j >= 0; j--) {
                            var vortex = file.selectionmask.vortexes[j];

                            file.selectionmask.lineTo(vortex.h, vortex.v);
                        }

                        file.selectionmask.stroke();
                    }

                    file.selectionmask.beginPath();
                    file.selectionmask.arc(prevXCoord, prevYCoord, radius, 0, PI2, false);
                    file.selectionmask.stroke();

                    file.selectionmask.isDrawing = true;
                }

                break;
            case 'Crop':
                if ($scope.mouseButtonId === 1) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);
                    var y = prevYCoord < yCoord ? prevYCoord : yCoord;
                    var x = prevXCoord < xCoord ? prevXCoord : xCoord;
                    var height = Math.abs(yCoord - prevYCoord);
                    var width = Math.abs(xCoord - prevXCoord);

                    file.cropmask.strokeStyleRgba(0, 0, 0, 255);
                    file.cropmask.fillStyleRgba(0, 0, 0, 0.5);
                    file.cropmask.clearRect();
                    file.cropmask.beginPath();
                    file.cropmask.rect(0, 0, file.cropmask.width(), file.cropmask.height());
                    file.cropmask.fill();

                    file.cropmask.clearRect(width, height, x, y);
                    file.cropmask.beginPath();
                    file.cropmask.rect(prevXCoord, prevYCoord, xCoord - prevXCoord, yCoord - prevYCoord);
                    file.cropmask.stroke();
                }

                break;
            case 'Airbrush':
                var color = null;

                if ($scope.mouseButtonId === 1) {
                    color = $scope.bgcolor;
                }
                else if ($scope.mouseButtonId === 2) {
                    color = $scope.fgcolor;
                }

                if (color) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);
                    var lastPoint = { x: prevXCoord, y: prevYCoord };
                    var currentPoint = { x: xCoord, y: yCoord };

                    var angle = angleBetween(lastPoint, currentPoint);
                    var distance = distanceBetween(lastPoint, currentPoint);

                    var opacity = $window.parseFloat($scope.selectedTool.options.opacity);
                    var size = $window.parseInt($scope.selectedTool.options.size);

                    file.editor.activeLayer.fillStyleRgba(color[1], color[2], color[0], opacity);
                    file.editor.activeLayer.lineCap('round');
                    file.editor.activeLayer.lineJoin('round');
                    file.editor.activeLayer.lineWidth(0);

                    for (var i = 0; i < distance; i += 3) {
                        y = lastPoint.y + (Math.cos(angle) * i);
                        x = lastPoint.x + (Math.sin(angle) * i);

                        file.editor.activeLayer.beginPath();
                        file.editor.activeLayer.arc(x, y, size, false, PI2, false);
                        file.editor.activeLayer.fill();
                    }

                    $scope.selectedTool.options.prevYCoord = yCoord;
                    $scope.selectedTool.options.prevXCoord = xCoord;
                }

                break;
            case 'Blur':
                if ($scope.mouseButtonId === 1 || $scope.mouseButtonId === 2) {
                    var size = $window.parseInt($scope.selectedTool.options.size);
                    file.editor.activeLayer.drawImage(file.editor.tempCanvas.canvas, xCoord, yCoord, size, size, xCoord, yCoord, size, size);
                }

                break;
            case 'Clone':
                if ($scope.mouseButtonId === 0) {
                    $scope.selectedTool.options.prevXCoord = xCoord;
                    $scope.selectedTool.options.prevYCoord = yCoord;
                }
                else if ($scope.mouseButtonId === 1) {
                    var offsetY = $window.parseInt($scope.selectedTool.options.offsetY);
                    var offsetX = $window.parseInt($scope.selectedTool.options.offsetX);
                    var size = $window.parseInt($scope.selectedTool.options.size);

                    file.editor.activeLayer.drawImage(file.editor.activeLayer.canvas, xCoord, yCoord, size, size, xCoord + offsetX, yCoord + offsetY, size, size);
                }
                else if ($scope.mouseButtonId === 2) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);

                    $scope.selectedTool.options.offsetY = yCoord - prevYCoord;
                    $scope.selectedTool.options.offsetX = xCoord - prevXCoord;
                }

                break;
            case 'Bucket Fill':
            case 'Zoom':

                break;
        }

        $scope.Redraw();
    });

    $scope.Overlay_OnMouseUp = (function ($event, $index, file) {
        $event.preventDefault();
        $event.stopPropagation();

        var overlay = angular.element('div.propeditordialog div#' + file.name.substring(0, file.name.indexOf('.')) + ' canvas.overlay');
        var yCoord = $window.parseInt(($event.originalEvent.clientY - overlay.offset().top) + windowElement.scrollTop());
        var xCoord = $window.parseInt(($event.originalEvent.clientX - overlay.offset().left) + windowElement.scrollLeft());

        switch ($scope.selectedTool.name) {
            case 'Bucket Fill':
            case 'Airbrush':
            case 'Pencil':
            case 'Eraser':
            case 'Clone':
            case 'Blur':
            case 'Move':
                if ($scope.mouseButtonId === 1 || $scope.mouseButtonId === 2) {
                    $scope.CreateHistoryEvent($scope.selectedTool.name + ' Tool', file, getHistoryLayers());
                }

                break;
            case 'Gradient':
                if ($scope.mouseButtonId === 1 && $scope.selectedTool.options.prevXCoord === null && $scope.selectedTool.options.prevYCoord === null) {
                    $scope.CreateHistoryEvent($scope.selectedTool.name + ' Tool', file, getHistoryLayers());
                }

                break;
            case 'Rectangle Select':
                if ($scope.mouseButtonId === 1 || $scope.mouseButtonId === 2) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);
                    var y = prevYCoord < yCoord ? prevYCoord : yCoord;
                    var x = prevXCoord < xCoord ? prevXCoord : xCoord;
                    var height = Math.abs(yCoord - prevYCoord);
                    var width = Math.abs(xCoord - prevXCoord);

                    if (!$scope.shiftKey) {
                        file.selectionmask.vortexes = [];
                    }

                    var newPoints = [
                        { v: y, h: x },
                        { v: y, h: x + width },
                        { v: y + height, h: x + width },
                        { v: y + height, h: x },
                    ];
                    for (var j = 0; j < newPoints.length; j++) {
                        var point = newPoints[j];
                        if (file.selectionmask.vortexes.length < 4 || !utilService.pointInPolygon(file.selectionmask.vortexes, point)) {
                            file.selectionmask.vortexes.push(point);
                        }
                    }
                }

                if (prevXCoord === xCoord && prevYCoord === yCoord) {
                    $scope.selectedFile.selectionmask.vortexes = null;

                    file.editor.activeLayer.restore();
                }

                $scope.selectedTool.options.prevYCoord = null;
                $scope.selectedTool.options.prevXCoord = null;

                file.selectionmask.isDrawing = false;

                break;
            case 'Ellipse Select':
                if ($scope.mouseButtonId === 1 || $scope.mouseButtonId === 2) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);
                    var height = Math.abs(yCoord - prevYCoord);
                    var width = Math.abs(xCoord - prevXCoord);
                    var radius = width > height ? width : height;
                    var radSq = Math.pow(radius, 2);

                    if (!$scope.shiftKey) {
                        file.selectionmask.vortexes = [];
                    }

                    var newPoints = [];

                    for (var x = -radius; x <= radius; x += 2) {
                        var y = $window.parseInt(Math.sqrt(radSq - Math.pow(x, 2)));

                        if (y === 0 && Math.abs(x) !== radius) continue;

                        newPoints.push({ v: prevYCoord + y, h: prevXCoord + x });
                    }

                    for (var x = radius - 2; x >= -radius; x -= 2) {
                        var y = $window.parseInt(Math.sqrt(radSq - Math.pow(x, 2)));

                        if (y === 0 && Math.abs(x) !== radius) continue;

                        newPoints.push({ v: prevYCoord - y, h: prevXCoord + x });
                    }

                    for (var j = 0; j < newPoints.length; j++) {
                        var point = newPoints[j];
                        if (!utilService.pointInPolygon(file.selectionmask.vortexes, point)) {
                            file.selectionmask.vortexes.push(point);
                        }
                    }
                }

                if (prevXCoord === xCoord && prevYCoord === yCoord) {
                    $scope.selectedFile.selectionmask.vortexes = null;

                    file.editor.activeLayer.restore();
                }

                $scope.selectedTool.options.prevYCoord = null;
                $scope.selectedTool.options.prevXCoord = null;

                file.selectionmask.isDrawing = false;

                break;
            case 'Crop':
                if ($scope.mouseButtonId === 1) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);
                    var newHeight = Math.abs(yCoord - prevYCoord);
                    var newWidth = Math.abs(xCoord - prevXCoord);

                    for (var j = 0; j < file.editor.layers.length; j++) {
                        var imageData = file.editor.layers[j].getImageData(xCoord, yCoord, newWidth, newHeight);

                        file.editor.layers[j].height(newHeight);
                        file.editor.layers[j].width(newWidth);

                        file.editor.layers[j].clearRect();
                        file.editor.layers[j].putImageData(0, 0, 0, 0, newWidth, newHeight, imageData);
                    }

                    var frontLayers = ['display', 'selectionmask', 'cropmask', 'text', 'cursor', 'overlay'];
                    for (var j = 0; j < frontLayers.length; j++) {
                        file[frontLayers[j]].height(newHeight);
                        file[frontLayers[j]].width(newWidth);
                    }

                    $scope.CreateHistoryEvent($scope.selectedTool.name + ' Tool', file, getHistoryLayers(), 'IMAGE_CROP');
                }

                break;
            case 'Color Picker':
            case 'Zoom':

                break;
        }

        $scope.mouseButtonId = 0;

        $scope.Redraw();
    });

    $scope.Overlay_OnKeyUp = (function ($event) {
        var file = $scope.selectedFile;

        if ($event && $event.originalEvent && $event.originalEvent.shiftKey === false) {
            $scope.shiftKey = false;
        }
        if ($event && $event.originalEvent && $event.originalEvent.ctrlKey === false) {
            $scope.ctrlKey = false;
        }
        if ($event && $event.originalEvent && $event.originalEvent.altKey === false) {
            $scope.altKey = false;
        }
    });

    $scope.Overlay_OnKeyDown = (function ($event) {
        var file = $scope.selectedFile;

        if ($event && $event.originalEvent && $event.originalEvent.shiftKey === true) {
            $scope.shiftKey = true;
        }
        if ($event && $event.originalEvent && $event.originalEvent.ctrlKey === true) {
            $scope.ctrlKey = true;
        }
        if ($event && $event.originalEvent && $event.originalEvent.altKey === true) {
            $scope.altKey = true;
        }

        if ($event) {
            switch ($event.originalEvent.keyCode) {
                case 86:
                    if ($event.originalEvent.ctrlKey) {
                        $scope.MenuOption_OnClick($event, 'EDIT_PASTE');
                    }

                    return;
                case 88:
                    if ($event.originalEvent.ctrlKey) {
                        $scope.MenuOption_OnClick($event, 'EDIT_CUT');
                    }

                    return;
                case 89:
                    if ($event.originalEvent.ctrlKey) {
                        $scope.MenuOption_OnClick($event, 'EDIT_REDO');
                    }

                    return;
                case 90:
                    if ($event.originalEvent.ctrlKey) {
                        $scope.MenuOption_OnClick($event, 'EDIT_UNDO');
                    }

                    return;
            }

            switch ($scope.selectedTool.name) {
                case 'Text':
                    switch ($event.originalEvent.keyCode) {
                        case 8:
                            file.text.buffer = file.text.buffer.substring(0, file.text.buffer.length - 1);

                            break;
                        case 13:
                            var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                            var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);
                            var size = $window.parseInt($scope.selectedTool.options.size);
                            var font = $scope.selectedTool.options.font;
                            var bgcolor = file.text.context.createLinearGradient(prevXCoord, prevYCoord, size, 0);
                            bgcolor.addColorStop(0, 'rgba(' + $scope.bgcolor[1] + ',' + $scope.bgcolor[2] + ',' + $scope.bgcolor[0] + ', 255)');
                            var fgcolor = file.text.context.createLinearGradient(prevXCoord, prevYCoord, size, 0);
                            fgcolor.addColorStop(0, 'rgba(' + $scope.fgcolor[1] + ',' + $scope.fgcolor[2] + ',' + $scope.fgcolor[0] + ', 255)');

                            var layer = new CanvasNode('2d');
                            layer.height(file.overlay.height());
                            layer.width(file.overlay.width());
                            layer.clearRect();
                            layer.layerId = utilService.createUID();
                            layer.name = 'Text Layer';
                            layer.visible = true;

                            layer.context.font = size + 'px ' + font;
                            layer.context.strokeStyle = bgcolor;
                            layer.context.fillStyle = fgcolor;
                            layer.context.fillText(file.text.buffer, prevXCoord + $window.parseInt(size / 5), prevYCoord + size - $window.parseInt(size / 5));
                            layer.context.strokeText(file.text.buffer, prevXCoord + $window.parseInt(size / 5), prevYCoord + size - $window.parseInt(size / 5));

                            file.editor.activeLayer = layer;
                            file.editor.layers.push(layer);
                            file.editor.activeIndex = file.editor.layers.length - 1;

                            $scope.CreateHistoryEvent('Created Layer: ' + layer.name, file, getHistoryLayers(), 'LAYER_NEW');
                            $scope.Redraw();

                            if ($event.originalEvent.shiftKey) {
                                var size = $window.parseInt($scope.selectedTool.options.size);

                                $scope.selectedTool.options.prevYCoord += size;
                            }
                            else {
                                $scope.selectedTool.options.prevYCoord = null;
                                $scope.selectedTool.options.prevXCoord = null;
                            }

                            file.text.buffer = '';

                            break;
                        default:
                            var char = String.fromCharCode($event.originalEvent.keyCode).toLowerCase();

                            if ($event.originalEvent.shiftKey) {
                                char = char.toUpperCase();
                            }

                            file.text.buffer += char;

                            break;
                    }

                    break;
                case 'Rectangle Select':
                case 'Ellipse Select':
                    switch ($event.originalEvent.keyCode) {
                        case 46:
                            clearSelection(file);

                            $scope.CreateHistoryEvent('Clear Selection', file, getHistoryLayers());

                            $scope.Redraw();

                            break;
                    }

                    break;
            }
        }

        switch ($scope.selectedTool.name) {
            case 'Text':
                var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);

                file.text.clearRect();

                if (!!prevXCoord && prevXCoord > 0 && !!prevYCoord && prevYCoord > 0) {
                    var size = $window.parseInt($scope.selectedTool.options.size);

                    file.text.lineWidth(1);
                    file.text.strokeStyleRgba(0, 0, 0, 255);

                    file.text.beginPath();
                    file.text.moveTo(prevXCoord, prevYCoord);
                    file.text.lineTo(prevXCoord, prevYCoord + size);
                    file.text.stroke();

                    var font = $scope.selectedTool.options.font;

                    file.text.lineWidth(1);
                    file.text.strokeStyleRgba(0, 0, 0, 255);

                    file.text.clearRect();
                    file.text.beginPath();
                    file.text.moveTo(prevXCoord, prevYCoord);
                    file.text.lineTo(prevXCoord, prevYCoord + size);
                    file.text.stroke();

                    var bgcolor = file.text.context.createLinearGradient(prevXCoord, prevYCoord, size, 0);
                    bgcolor.addColorStop(0, 'rgba(' + $scope.bgcolor[1] + ',' + $scope.bgcolor[2] + ',' + $scope.bgcolor[0] + ', 255)');
                    var fgcolor = file.text.context.createLinearGradient(prevXCoord, prevYCoord, size, 0);
                    fgcolor.addColorStop(0, 'rgba(' + $scope.fgcolor[1] + ',' + $scope.fgcolor[2] + ',' + $scope.fgcolor[0] + ', 255)');
                    file.text.context.font = size + 'px ' + font;
                    file.text.context.strokeStyle = bgcolor;
                    file.text.context.fillStyle = fgcolor;
                    file.text.context.fillText(file.text.buffer, prevXCoord + $window.parseInt(size / 5), prevYCoord + size - $window.parseInt(size / 5));
                    file.text.context.strokeText(file.text.buffer, prevXCoord + $window.parseInt(size / 5), prevYCoord + size - $window.parseInt(size / 5));
                }

                break;
        }
    });

    $scope.MenuOption_OnClick = (function ($event, option, skipRedraw) {
        $event.preventDefault();
        $event.stopPropagation();

        var file = $scope.selectedFile;

        switch (option) {
            case 'FILE_OPEN':
                var filesCtrl = angular.element('div.propeditordialog input#load');

                if (filesCtrl.length > 0) {
                    filesCtrl.click();

                    var files = filesCtrl.get(0).files;

                    if (filesCtrl.val().length > 0 && files.length > 0) {
                        for (var j = 0; j < files.length; j++) {
                            var file = files[j];

                            for (var k = 0; k < $scope.fileList.length; k++) {
                                if ($scope.fileList[k].name === file.name) {
                                    file = null;

                                    break;
                                }
                            }

                            if (file === null) {
                                continue;
                            }

                            var r = new FileReader();
                            r.onload = function () {
                                var i = new ImageObject({
                                    sourceUrl: r.result,
                                    resolve: function (response) {
                                        $scope.fileList.push({
                                            name: file.name,
                                            isDirty: false,
                                            image: this,
                                        });

                                        $scope.$apply();

                                        return;
                                    },
                                    reject: function (errors) {
                                        return;
                                    },
                                });
                                i.load();
                            }
                            r.readAsDataURL(file);
                        }

                        filesCtrl.val('');
                    }
                }

                break;
            case 'FILE_SAVE':
                if (file) {
                    var url = file.display.toDataURL('image/png').replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
                    url = url.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=' + file.name);

                    var filesCtrl = angular.element('div.propeditordialog a#save');
                    filesCtrl.attr('download', file.name);
                    filesCtrl.attr('href', url);
                }

                break;
            case 'EDIT_UNDO':
                if (file && file.historyEvents.length > 1) {
                    var historyEvent = file.historyEvents.pop();

                    file.redoEvents.unshift(historyEvent);

                    switch (historyEvent.type) {
                        case 'LAYER_NEW':
                            for (var j = 0; j < file.editor.layers.length; j++) {
                                for (var k = 0; k < historyEvent.layers.length; k++) {
                                    if (file.editor.layers[j].layerId === historyEvent.layers[k].layerId && historyEvent.layers[k].isNew) {
                                        file.editor.layers.splice(j, 1);
                                    }
                                }
                            }

                            while (file.editor.activeIndex >= file.editor.layers.length) {
                                file.editor.activeIndex--;
                            }

                            file.editor.activeLayer = file.editor.layers[file.editor.activeIndex];

                            break;
                        case 'LAYER_DELETE':
                            for (var j = 0; j < historyEvent.layers.length; j++) {
                                if (historyEvent.layers[j].isDeleted) {
                                    var layer = new CanvasNode('2d');
                                    layer.name = historyEvent.layers[j].name;
                                    layer.layerId = historyEvent.layers[j].layerId;
                                    layer.visible = historyEvent.layers[j].visible;

                                    layer.clearRect();
                                    layer.drawImage(historyEvent.layers[j].image.image, 0, 0);

                                    file.editor.layers.splice(historyEvent.layers[j].position, 0, layer);

                                    file.editor.activeIndex = historyEvent.layers[j].position;
                                    file.editor.activeLayer = file.editor.layers[historyEvent.layers[j].position];
                                }
                            }

                            break;
                        case 'LAYER_MOVE':
                            for (var j = 0; j < historyEvent.layers.length; j++) {
                                if (historyEvent.layers[j].beforePosition) {
                                    var layer = file.editor.layers[historyEvent.layers[j].position];

                                    file.editor.layers.splice(historyEvent.layers[j].position, 1);

                                    file.editor.layers.splice(historyEvent.layers[j].beforePosition, 0, layer);

                                    break;
                                }
                            }

                            break;
                    }

                    if (!skipRedraw) {
                        $scope.Redraw(true);
                    }
                }

                break;
            case 'EDIT_REDO':
                if (file && file.redoEvents.length > 0) {
                    var historyEvent = file.redoEvents.shift();

                    file.historyEvents.push(historyEvent);

                    switch (historyEvent.type) {
                        case 'LAYER_NEW':
                            for (var j = 0; j < historyEvent.layers.length; j++) {
                                if (historyEvent.layers[j].isNew) {
                                    var layer = new CanvasNode('2d');
                                    layer.name = historyEvent.layers[j].name;
                                    layer.layerId = historyEvent.layers[j].layerId;
                                    layer.visible = historyEvent.layers[j].visible;

                                    layer.clearRect();
                                    layer.drawImage(historyEvent.layers[j].image.image, 0, 0);

                                    file.editor.layers.splice(historyEvent.layers[j].position, 0, layer);

                                    file.editor.activeIndex = historyEvent.layers[j].position;
                                    file.editor.activeLayer = file.editor.layers[historyEvent.layers[j].position];
                                }
                            }

                            break;
                        case 'LAYER_DELETE':
                            for (var j = 0; j < file.editor.layers.length; j++) {
                                for (var k = 0; k < historyEvent.layers.length; k++) {
                                    if (file.editor.layers[j].layerId === historyEvent.layers[k].layerId && historyEvent.layers[k].isDeleted) {
                                        file.editor.layers.splice(j, 1);
                                    }
                                }
                            }

                            while (file.editor.activeIndex >= file.editor.layers.length) {
                                file.editor.activeIndex--;
                            }

                            file.editor.activeLayer = file.editor.layers[file.editor.activeIndex];

                            break;
                        case 'LAYER_MOVE':
                            for (var j = 0; j < historyEvent.layers.length; j++) {
                                if (historyEvent.layers[j].beforePosition !== undefined) {
                                    var layer = file.editor.layers[historyEvent.layers[j].beforePosition];

                                    file.editor.layers.splice(historyEvent.layers[j].beforePosition, 1);

                                    file.editor.layers.splice(historyEvent.layers[j].position, 0, layer);

                                    break;
                                }
                            }

                            break;
                    }

                    if (!skipRedraw) {
                        $scope.Redraw(true);
                    }
                }

                break;
            case 'EDIT_COPY':
            case 'EDIT_CUT':
                if (file.selectionmask.vortexes && file.selectionmask.vortexes.length > 0) {
                    var boundingBox = utilService.getBoundingBox(file.selectionmask.vortexes);

                    $scope.clipboard = new CanvasNode('2d');
                    $scope.clipboard.height(boundingBox.height);
                    $scope.clipboard.width(boundingBox.width);

                    $scope.clipboard.save();

                    $scope.clipboard.clearRect();

                    $scope.clipboard.beginPath();
                    $scope.clipboard.moveTo(file.selectionmask.vortexes[0].h - boundingBox.left, file.selectionmask.vortexes[0].v - boundingBox.top);

                    for (var j = file.selectionmask.vortexes.length - 1; j >= 0; j--) {
                        $scope.clipboard.lineTo(file.selectionmask.vortexes[j].h - boundingBox.left, file.selectionmask.vortexes[j].v - boundingBox.top);
                    }

                    $scope.clipboard.context.clip();

                    $scope.clipboard.drawImage(file.editor.activeLayer.canvas, 0, 0, boundingBox.width, boundingBox.height, boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height);

                    $scope.clipboard.restore();

                    if (option === 'EDIT_CUT') {
                        clearSelection(file);

                        $scope.CreateHistoryEvent('Cut Selection', file, getHistoryLayers());

                        $scope.Redraw();
                    }
                }

                break;
            case 'EDIT_PASTE':
                if ($scope.clipboard) {
                    var layer = new CanvasNode('2d');
                    layer.height(file.overlay.height());
                    layer.width(file.overlay.width());
                    layer.clearRect();
                    layer.layerId = utilService.createUID();
                    layer.name = 'Pasted Layer';
                    layer.visible = true;

                    var height = $scope.clipboard.height();
                    var width = $scope.clipboard.width();
                    var yCoord = Math.abs((file.overlay.height() / 2) - (height / 2));
                    var xCoord = Math.abs((file.overlay.width() / 2) - (width / 2));

                    layer.drawImage($scope.clipboard.canvas, xCoord, yCoord, width, height, 0, 0, width, height);

                    file.editor.activeLayer = layer;
                    file.editor.layers.push(layer);
                    file.editor.activeIndex = file.editor.layers.length - 1;

                    var layers = getHistoryLayers();

                    for (var j = 0; j < layers.length; j++) {
                        if (layers[j].layerId === layer.layerId) {
                            layers[j].isNew = true;
                        }
                    }

                    file.selectionmask.vortexes = null;

                    $scope.CreateHistoryEvent('Pasted Layer: ' + layer.name, file, layers, 'LAYER_NEW');

                    $scope.Redraw();
                }

                break;
            case 'LAYER_NEW':
                if (file) {
                    var layer = new CanvasNode('2d');
                    layer.height(file.overlay.height());
                    layer.width(file.overlay.width());
                    layer.clearRect();
                    layer.layerId = utilService.createUID();
                    layer.name = 'New Layer';
                    layer.visible = true;

                    file.editor.activeLayer = layer;
                    file.editor.layers.push(layer);
                    file.editor.activeIndex = file.editor.layers.length - 1;

                    var layers = getHistoryLayers();

                    for (var j = 0; j < layers.length; j++) {
                        if (layers[j].layerId === layer.layerId) {
                            layers[j].isNew = true;
                        }
                    }

                    $scope.CreateHistoryEvent('Created Layer: ' + layer.name, file, layers, 'LAYER_NEW');

                    $scope.Redraw();
                }

                break;
            case 'LAYER_DELETE':
                if (file && file.editor.layers.length > 1) {
                    var position = file.editor.activeIndex;
                    var layer = file.editor.layers[position];
                    var layers = getHistoryLayers();

                    for (var j = 0; j < layers.length; j++) {
                        if (layers[j].layerId === layer.layerId) {
                            layers[j].isDeleted = true;
                        }
                    }

                    file.editor.layers.splice(position, 1);

                    if (position > 0) {
                        file.editor.activeIndex--;
                    }

                    file.editor.activeLayer = file.editor.layers[file.editor.activeIndex];

                    $scope.CreateHistoryEvent('Deleted Layer: ' + layer.name, file, layers, 'LAYER_DELETE');

                    $scope.Redraw();
                }

                break;
            case 'LAYER_MERGEDOWN':
                if (file && file.editor.layers.length > 1) {
                    var position = file.editor.activeIndex;

                    if (position > 0) {
                        var layer = file.editor.layers[position - 1];
                        var tempCanvas = new CanvasNode('2d');
                        tempCanvas.height(file.overlay.height());
                        tempCanvas.width(file.overlay.width());
                        tempCanvas.clearRect();

                        tempCanvas.drawImage(layer.canvas, 0, 0);
                        tempCanvas.drawImage(file.editor.layers[position].canvas, 0, 0);

                        file.editor.layers[position - 1] = tempCanvas;
                        file.editor.layers[position - 1].name = layer.name;
                        file.editor.layers[position - 1].layerId = layer.layerId;
                        file.editor.layers[position - 1].visible = file.editor.layers[position].visible;

                        var layers = getHistoryLayers();

                        for (var j = 0; j < layers.length; j++) {
                            if (layers[j].layerId === file.editor.layers[position].layerId) {
                                layers[j].isDeleted = true;

                                break;
                            }
                        }

                        file.editor.layers.splice(position, 1);

                        file.editor.activeIndex = position - 1;
                        file.editor.activeLayer = file.editor.layers[file.editor.activeIndex];

                        $scope.CreateHistoryEvent('Merge Down: ' + layer.name, file, layers, 'LAYER_DELETE');

                        $scope.Redraw(true);
                    }
                }

                break;
            case 'LAYER_MERGEUP':
                if (file && file.editor.layers.length > 1) {
                    var position = file.editor.activeIndex;

                    if (position < file.editor.layers.length - 1) {
                        var layer = file.editor.layers[position + 1];
                        var tempCanvas = new CanvasNode('2d');
                        tempCanvas.height(file.overlay.height());
                        tempCanvas.width(file.overlay.width());
                        tempCanvas.clearRect();

                        tempCanvas.drawImage(file.editor.layers[position].canvas, 0, 0);
                        tempCanvas.drawImage(layer.canvas, 0, 0);

                        file.editor.layers[position + 1] = tempCanvas;
                        file.editor.layers[position + 1].name = layer.name;
                        file.editor.layers[position + 1].layerId = layer.layerId;
                        file.editor.layers[position + 1].visible = file.editor.layers[position].visible;

                        var layers = getHistoryLayers();

                        for (var j = 0; j < layers.length; j++) {
                            if (layers[j].layerId === file.editor.layers[position].layerId) {
                                layers[j].isDeleted = true;

                                break;
                            }
                        }

                        file.editor.layers.splice(position, 1);

                        //file.editor.activeIndex = position + 0;
                        file.editor.activeLayer = file.editor.layers[file.editor.activeIndex];

                        $scope.CreateHistoryEvent('Merge Up: ' + layer.name, file, layers, 'LAYER_DELETE');

                        $scope.Redraw(true);
                    }
                }

                break;
            case 'LAYER_FLATTEN':
                if (file && file.editor.layers.length > 0) {
                    var layer = file.editor.layers[0];
                    var tempCanvas = new CanvasNode('2d');
                    tempCanvas.height(file.overlay.height());
                    tempCanvas.width(file.overlay.width());
                    tempCanvas.clearRect();

                    for (var j = 0; j < file.editor.layers.length; j++) {
                        tempCanvas.drawImage(file.editor.layers[j].canvas, 0, 0);
                    }

                    file.editor.layers[0] = tempCanvas;
                    file.editor.layers[0].layerId = layer.layerId;
                    file.editor.layers[0].visible = layer.visible;
                    file.editor.layers[0].name = layer.name;

                    var layers = getHistoryLayers();

                    file.editor.layers.splice(1, file.editor.layers.length - 1);

                    for (var j = 0; j < layers.length; j++) {
                        if (layers[j].layerId !== file.editor.layers[0].layerId) {
                            layers[j].isDeleted = true;
                        }
                    }

                    file.editor.activeIndex = 0;
                    file.editor.activeLayer = file.editor.layers[file.editor.activeIndex];

                    $scope.CreateHistoryEvent('Flatten Layers', file, layers, 'LAYER_DELETE');

                    $scope.Redraw(true);
                }

                break;
            case 'LAYER_ROTATE-90':
            case 'LAYER_ROTATE-180':
            case 'LAYER_ROTATE90':
            case 'LAYER_ROTATE180':
                var degrees = 0;

                switch (option) {
                    case 'LAYER_ROTATE-90':
                        degrees = -90;

                        break;
                    case 'LAYER_ROTATE-180':
                        degrees = -180;

                        break;
                    case 'LAYER_ROTATE90':
                        degrees = 90;

                        break;
                    case 'LAYER_ROTATE180':
                        degrees = 180;

                        break;
                }

                if (file && degrees !== 0) {
                    var height = file.overlay.height();
                    var width = file.overlay.width();
                    var size = (height > width ? height : width) * 1.5;

                    var tempCanvas = new CanvasNode('2d');
                    tempCanvas.height(size);
                    tempCanvas.width(size);

                    tempCanvas.context.translate(size / 2, size / 2);
                    tempCanvas.context.rotate(degrees * Math.PI / 180);
                    tempCanvas.context.translate(-(size / 2), -(size / 2));

                    tempCanvas.clearRect();
                    tempCanvas.drawImage(file.editor.activeLayer.canvas, 0, 0);

                    file.editor.activeLayer.height(size);
                    file.editor.activeLayer.width(size);
                    file.editor.activeLayer.clearRect();
                    file.editor.activeLayer.drawImage(tempCanvas.canvas, 0, 0);

                    file.overlay.height(size);
                    file.overlay.width(size);

                    $scope.CreateHistoryEvent('Rotate ' + degrees + ': ' + file.editor.activeLayer.name, file, getHistoryLayers());

                    $scope.Redraw(true);
                }

                break;
            case 'LAYER_MOVEUP':
            case 'LAYER_MOVEDOWN':
            case 'LAYER_MOVETOP':
            case 'LAYER_MOVEBOTTOM':
                if (file) {
                    switch (option) {
                        case 'LAYER_MOVEUP':
                        case 'LAYER_MOVETOP':
                            if (file.editor.activeIndex === file.editor.layers.length - 1) return;
                            break;
                        case 'LAYER_MOVEDOWN':
                        case 'LAYER_MOVEBOTTOM':
                            if (file.editor.activeIndex === 0) return;
                            break;
                    }

                    var layer = file.editor.layers[file.editor.activeIndex];
                    var beforePosition = file.editor.activeIndex;

                    file.editor.layers.splice(file.editor.activeIndex, 1);

                    switch (option) {
                        case 'LAYER_MOVEUP':
                            file.editor.activeIndex++;

                            break;
                        case 'LAYER_MOVEDOWN':
                            file.editor.activeIndex--;

                            break;
                        case 'LAYER_MOVETOP':
                            file.editor.activeIndex = file.editor.layers.length;

                            break;
                        case 'LAYER_MOVEBOTTOM':
                            file.editor.activeIndex = 0;

                            break;
                    }

                    file.editor.layers.splice(file.editor.activeIndex, 0, layer);

                    var layers = getHistoryLayers();

                    for (var j = 0; j < layers.length; j++) {
                        if (layers[j].layerId === layer.layerId) {
                            layers[j].beforePosition = beforePosition;

                            break;
                        }
                    }

                    $scope.CreateHistoryEvent(option + ': ' + layer.name, file, layers, 'LAYER_MOVE');

                    $scope.Redraw(true);
                }

                break;
            case 'IMAGE_CANVASSIZE':
            case 'IMAGE_IMAGESIZE':
                if (file) {
                    dialogService.toolOptions({
                        option: option,
                        height: file.overlay.height(),
                        width: file.overlay.width(),
                    }).then(function (response) {
                        if (response) {
                            var newHeight = $window.parseInt(response.height);
                            var newWidth = $window.parseInt(response.width);
                            var lHeight = file.overlay.height();
                            var lWidth = file.overlay.width();

                            for (var j = 0; j < file.editor.layers.length; j++) {
                                var imageData = file.editor.layers[j].getImageData(0, 0, lWidth, lHeight);

                                file.editor.layers[j].height(newHeight);
                                file.editor.layers[j].width(newWidth);

                                file.editor.layers[j].clearRect();
                                file.editor.layers[j].putImageData(0, 0, 0, 0, lWidth, lHeight, imageData);
                            }

                            var frontLayers = ['display', 'selectionmask', 'cropmask', 'text', 'cursor', 'overlay'];
                            for (var j = 0; j < frontLayers.length; j++) {
                                file[frontLayers[j]].height(newHeight);
                                file[frontLayers[j]].width(newWidth);
                            }

                            var label = null;

                            if (option === 'IMAGE_IMAGESIZE') {
                                label = 'Image';
                            }
                            else {
                                label = 'Canvas';
                            }

                            $scope.CreateHistoryEvent('Resize ' + label, file, getHistoryLayers());

                            $scope.Redraw();
                        }
                    }, function (errors) {
                    });
                }

                break;
            case 'IMAGE_ROTATE-90':
            case 'IMAGE_ROTATE-180':
            case 'IMAGE_ROTATE90':
            case 'IMAGE_ROTATE180':
                var degrees = 0;

                switch (option) {
                    case 'IMAGE_ROTATE-90':
                        degrees = -90;

                        break;
                    case 'IMAGE_ROTATE-180':
                        degrees = -180;

                        break;
                    case 'IMAGE_ROTATE90':
                        degrees = 90;

                        break;
                    case 'IMAGE_ROTATE180':
                        degrees = 180;

                        break;
                }

                if (file && degrees !== 0) {
                    var height = file.overlay.height();
                    var width = file.overlay.width();
                    var size = (height > width ? height : width) * 1.5;

                    var tempCanvas = new CanvasNode('2d');
                    tempCanvas.height(size);
                    tempCanvas.width(size);

                    tempCanvas.context.translate(size / 2, size / 2);
                    tempCanvas.context.rotate(degrees * Math.PI / 180);
                    tempCanvas.context.translate(-(size / 2), -(size / 2));

                    for (var j = 0; j < file.editor.layers.length; j++) {
                        tempCanvas.clearRect();
                        tempCanvas.drawImage(file.editor.layers[j].canvas, 0, 0);

                        file.editor.layers[j].height(size);
                        file.editor.layers[j].width(size);
                        file.editor.layers[j].clearRect();
                        file.editor.layers[j].drawImage(tempCanvas.canvas, 0, 0);
                    }

                    file.overlay.height(size);
                    file.overlay.width(size);

                    $scope.CreateHistoryEvent('Rotate ' + degrees + ': Image', file, getHistoryLayers());

                    $scope.Redraw(true);
                }

                break;
            case 'EFFECTS_HEXAGONALPIXELATE':
            case 'EFFECTS_BASICBLURIMAGE':
            case 'EFFECTS_UNSHARPMASK':
            case 'EFFECTS_ZOOMBLUR':
            case 'EFFECTS_VIBRANCE':
            case 'EFFECTS_VIGNETTE':
            case 'EFFECTS_LENSBLUR':
            case 'EFFECTS_DENOISE':
            case 'EFFECTS_SEPIA':
            case 'EFFECTS_NOISE':
            case 'EFFECTS_SWIRL':
            case 'EFFECTS_INK':
            case 'EFFECTS_BNC':
            case 'EFFECTS_HNS':
                if (file) {
                    dialogService.effectOptions({
                        canvas: file.editor.activeLayer,
                        effect: option,
                    }).then(function (response) {
                        if (response) {
                            file.editor.activeLayer.clearRect();
                            file.editor.activeLayer.drawImage(response.canvas, 0, 0);

                            $scope.CreateHistoryEvent(option, file, getHistoryLayers());

                            $scope.Redraw(true);
                        }
                    }, function (errors) {
                    });
                }

                break;
        }
    });

    $scope.CreateHistoryEvent = (function (label, file, layers, type) {
        var _label = label || 'Unknown Event';
        var _file = file || $scope.selectedFile;
        var _layers = layers || getHistoryLayers(file.editor.activeLayer.layerId);
        var _type = type || 'NONE';

        if (_file) {
            var historyEvent = {
                layers: _layers,
                historyId: utilService.createUID(),
                height: _file.overlay.height(),
                width: _file.overlay.width(),
                label: _label,
                type: _type,
            }
            _file.historyEvents.push(historyEvent);
            _file.isDirty = true;

            _file.redoEvents = [];
        }
    });

    $scope.LayerVisibility_OnClick = (function ($event, $index, layer) {
        if (layer) {
            layer.visible = !layer.visible;

            $scope.Redraw();
        }
    });

    $scope.LayerSelect_OnClick = (function ($event, $index, layer) {
        var file = $scope.selectedFile;

        if (file && layer) {
            file.editor.activeIndex = $index;
            file.editor.activeLayer = layer;

            var height = file.overlay.height();
            var width = file.overlay.width();

            file.editor.tempCanvas = file.editor.activeLayer.getImageData(0, 0, width, height);

            $scope.Redraw();
        }
    });

    $scope.HistoryEvent_OnClick = (function ($event, $index, history) {
        var file = $scope.selectedFile;

        while (file.historyEvents.length > 1) {
            try {
                $scope.MenuOption_OnClick($event, 'EDIT_UNDO', true);
            } catch (e) {
                return;
            }

            if (file.historyEvents[file.historyEvents.length - 1].historyId === history.historyId) {
                break;
            }
        }

        $scope.Redraw(true);
    });

    $scope.RedoEvent_OnClick = (function ($event, $index, redo) {
        var file = $scope.selectedFile;

        while (file.redoEvents.length > 0) {
            var historyId = file.redoEvents[0].historyId;

            try {
                $scope.MenuOption_OnClick($event, 'EDIT_REDO', true);
            } catch (e) {
                return;
            }

            if (historyId === redo.historyId) {
                break;
            }
        }

        $scope.Redraw(true);
    });

    $scope.Save_OnClick = (function ($event) {
        var toolbox = angular.element('div#toolbox');
        var history = angular.element('div#history');
        var layers = angular.element('div#layers');
        var controls = [toolbox, history, layers];

        var sHeight = windowElement.height();
        var sWidth = windowElement.width();

        for (var j = 0; j < controls.length; j++) {
            var y = $window.parseInt(controls[j].css('top') || 0);
            var x = $window.parseInt(controls[j].css('left') || 0);

            if (isNaN(y)) y = 0;
            if (isNaN(x)) x = 0;

            if (y > sHeight) y = 0;
            if (x > sWidth) x = 0;

            $window.localStorage.setObject(controls[j].attr('id') + '-position', { v: y, h: x });
        }

        $scope.$close($scope.model);
    });
}]);
