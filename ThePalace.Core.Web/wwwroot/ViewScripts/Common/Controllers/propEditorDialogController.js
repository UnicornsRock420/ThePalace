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
                { value: 'times', label: 'Times New Roman' },
                { value: 'verdana', label: 'Verdana' },
            ],
        },
    }];
    $scope.mouseButtonId = 0;
    $scope.selectedTool = $scope.toolbar[0];
    $scope.selectedFile = null;
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

    var distanceBetween = function (point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    var angleBetween = function (point1, point2) {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }

    $scope.FileOpen_OnInit = (function (file) {
        $timeout(function () {
            var fileName = file.name.substring(0, file.name.indexOf('.'));

            $scope.selectedFile = file;

            file.editorHistory = [];
            file.editorHistory.push({
                image: file.image,
                canvasHeight: file.image.height,
                canvasWidth: file.image.width,
            });

            file.editor = new CanvasNode('2d');
            file.editor.height(file.image.height);
            file.editor.width(file.image.width);

            var display = angular.element('div.propeditordialog div#' + fileName + ' canvas.display');
            if (display.length > 0) {
                file.display = new CanvasNode('2d', display);
                file.display.height(file.image.height);
                file.display.width(file.image.width);
                file.display.scale = 1;
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

            $scope.Redraw(true);
        }, 0);
    });

    $scope.FileButtons_OnClick = (function ($event, $index, file, mode) {
        switch (mode) {
            case 'CLOSE':
                if ($scope.selectedFile && $scope.selectedFile.isDirty) {
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
        }
    });

    $scope.ToolBar_OnClick = (function ($event, tool) {
        $scope.selectedTool = tool;

        if ($scope.selectedFile) {
            $scope.selectedFile.editor.restore();
        }

        switch ($scope.selectedTool.name) {
            case 'Gradient':
                $scope.selectedTool.options.prevYCoord = null;
                $scope.selectedTool.options.prevXCoord = null;

                break;
        }
    });

    $scope.ToolOptions_OnChange = (function ($event, name) {
        $scope.selectedFile.tempCanvas = null;

        switch ($scope.selectedTool.name) {
            case 'Blur':
                var iterations = $window.parseInt($scope.selectedTool.options.iterations);
                var radius = $window.parseInt($scope.selectedTool.options.radius);
                var canvasHeight = $scope.selectedFile.overlay.height();
                var canvasWidth = $scope.selectedFile.overlay.width();

                $scope.selectedFile.tempCanvas = new CanvasNode('2d');
                $scope.selectedFile.tempCanvas.height(canvasHeight);
                $scope.selectedFile.tempCanvas.width(canvasWidth);

                $scope.selectedFile.tempCanvas.drawImage($scope.selectedFile.editor.canvas, 0, 0, canvasWidth, canvasHeight);

                boxBlurCanvasRGBA($scope.selectedFile.tempCanvas, 0, 0, canvasWidth, canvasHeight, radius, iterations);

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
        if ($scope.selectedFile) {
            if (restoreHistory && $scope.selectedFile.editorHistory && $scope.selectedFile.editorHistory.length > 0) {
                var historyEntry = $scope.selectedFile.editorHistory[$scope.selectedFile.editorHistory.length - 1];

                if (historyEntry) {
                    $scope.selectedFile.editor.height(historyEntry.canvasHeight);
                    $scope.selectedFile.editor.width(historyEntry.canvasWidth);
                    $scope.selectedFile.display.height(historyEntry.canvasHeight);
                    $scope.selectedFile.display.width(historyEntry.canvasWidth);
                    $scope.selectedFile.selectionmask.height(historyEntry.canvasHeight);
                    $scope.selectedFile.selectionmask.width(historyEntry.canvasWidth);
                    $scope.selectedFile.cropmask.height(historyEntry.canvasHeight);
                    $scope.selectedFile.cropmask.width(historyEntry.canvasWidth);
                    $scope.selectedFile.text.height(historyEntry.canvasHeight);
                    $scope.selectedFile.text.width(historyEntry.canvasWidth);
                    $scope.selectedFile.cursor.height(historyEntry.canvasHeight);
                    $scope.selectedFile.cursor.width(historyEntry.canvasWidth);
                    $scope.selectedFile.overlay.height(historyEntry.canvasHeight);
                    $scope.selectedFile.overlay.width(historyEntry.canvasWidth);

                    $scope.selectedFile.editor.clearRect();
                    $scope.selectedFile.editor.drawImage(historyEntry.image.image, 0, 0);
                }
            }

            if (!$scope.selectedFile.selectionmask.isDrawing && $scope.selectedFile.selectionmask.vortexes && $scope.selectedFile.selectionmask.vortexes.length > 0) {
                $scope.selectedFile.selectionmask.strokeStyleRgba(255, 255, 255, 255);
                $scope.selectedFile.selectionmask.clearRect();

                $scope.selectedFile.editor.restore();
                $scope.selectedFile.editor.save();

                $scope.selectedFile.selectionmask.beginPath();
                $scope.selectedFile.editor.beginPath();

                $scope.selectedFile.selectionmask.moveTo($scope.selectedFile.selectionmask.vortexes[0].h, $scope.selectedFile.selectionmask.vortexes[0].v);
                $scope.selectedFile.editor.moveTo($scope.selectedFile.selectionmask.vortexes[0].h, $scope.selectedFile.selectionmask.vortexes[0].v);

                for (var j = $scope.selectedFile.selectionmask.vortexes.length - 1; j >= 0; j--) {
                    var vortex = $scope.selectedFile.selectionmask.vortexes[j];

                    $scope.selectedFile.selectionmask.lineTo(vortex.h, vortex.v);
                    $scope.selectedFile.editor.lineTo(vortex.h, vortex.v);
                }
                $scope.selectedFile.selectionmask.stroke();
                $scope.selectedFile.editor.context.clip();
            }

            var canvasHeight = $scope.selectedFile.overlay.height();
            var canvasWidth = $scope.selectedFile.overlay.width();

            $scope.selectedFile.display.clearRect();
            $scope.selectedFile.display.context.save();
            $scope.selectedFile.display.context.translate(canvasWidth * 0.5, canvasHeight * 0.5);
            $scope.selectedFile.display.context.scale($scope.selectedFile.display.scale, $scope.selectedFile.display.scale);
            $scope.selectedFile.display.context.drawImage($scope.selectedFile.editor.canvas, -canvasWidth * 0.5, -canvasHeight * 0.5);
            $scope.selectedFile.display.context.restore();
        }
    });

    $scope.Overlay_OnMouseDown = (function ($event, $index, file) {
        $event.preventDefault();
        $event.stopPropagation();

        var overlay = angular.element('div.propeditordialog div#' + file.name.substring(0, file.name.indexOf('.')) + ' canvas.overlay');
        var yCoord = ($event.originalEvent.clientY - overlay.offset().top) + windowElement.scrollTop();
        var xCoord = ($event.originalEvent.clientX - overlay.offset().left) + windowElement.scrollLeft();

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

                    file.editor.fillStyleRgba(color[1], color[2], color[0], 255);
                    file.editor.beginPath();
                    if ($scope.selectedTool.options.shape === 'square') {
                        file.editor.rect(xCoord - size, yCoord - size, size * 2, size * 2);
                    }
                    else if ($scope.selectedTool.options.shape === 'round') {
                        file.editor.arc(xCoord, yCoord, size, 0, PI2);
                    }
                    file.editor.fill();
                }

                break;
            case 'Color Picker':
                var pixel = file.editor.getPixelData(xCoord, yCoord);

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
                            b = imageData.data[pixelPos + 2];

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

                    var canvasHeight = file.overlay.height();
                    var canvasWidth = file.overlay.width();
                    var imageData = file.editor.getImageData(0, 0, canvasWidth, canvasHeight);
                    var tolerance = $window.parseFloat($scope.selectedTool.options.tolerance);

                    var outlineCanvas = new CanvasNode('2d');
                    outlineCanvas.height(canvasHeight);
                    outlineCanvas.width(canvasWidth);
                    outlineCanvas.lineWidth(1);
                    outlineCanvas.strokeStyleRgba(0, 0, 0, 255);
                    outlineCanvas.fillStyleRgba(255, 255, 255, 255);
                    outlineCanvas.moveTo(0, 0);
                    outlineCanvas.lineTo(canvasWidth, 0);
                    outlineCanvas.lineTo(canvasWidth, canvasHeight);
                    outlineCanvas.lineTo(0, canvasHeight);
                    outlineCanvas.lineTo(0, 0);
                    outlineCanvas.stroke();
                    outlineCanvas.fill();
                    var outlineData = outlineCanvas.getImageData(0, 0, canvasWidth, canvasHeight);

                    var startCoord = (xCoord + (yCoord * canvasWidth)) * 4;
                    var startR = imageData.data[startCoord + 0];
                    var startG = imageData.data[startCoord + 1];
                    var startB = imageData.data[startCoord + 2];

                    var pixelStack = [[xCoord, yCoord]];

                    while (pixelStack.length) {
                        var newPos = pixelStack.pop();
                        var y = newPos[1];
                        var x = newPos[0];

                        var pixelPos = (y * canvasWidth + x) * 4;
                        while (y-- >= 0 && matchStartColor(pixelPos)) {
                            pixelPos -= canvasWidth * 4;
                        }

                        pixelPos += canvasWidth * 4;
                        y++;

                        var reachLeft = false;
                        var reachRight = false;

                        while (y++ < canvasHeight - 1 && matchStartColor(pixelPos)) {
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

                            if (x < canvasWidth - 1) {
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

                            pixelPos += canvasWidth * 4;
                        }
                    }

                    file.tempCanvas = new CanvasNode('2d');
                    file.tempCanvas.height(canvasHeight);
                    file.tempCanvas.width(canvasWidth);
                    file.tempCanvas.putImageData(0, 0, 0, 0, canvasWidth, canvasHeight, imageData);

                    file.editor.drawImage(file.tempCanvas.canvas, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

                    file.tempCanvas = null;
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
                    file.editor.context.save();

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
                            colorStops = file.editor.context.createLinearGradient(prevXCoord, prevYCoord, xCoord, yCoord);
                        }
                        else {
                            colorStops = file.editor.context.createRadialGradient(prevXCoord, prevYCoord, radius, xCoord, yCoord, radius);
                        }

                        colorStops.addColorStop(0, 'rgba(' + $scope.bgcolor[1] + ',' + $scope.bgcolor[2] + ',' + $scope.bgcolor[0] + ', 255)');
                        colorStops.addColorStop(1, 'rgba(' + $scope.fgcolor[1] + ',' + $scope.fgcolor[2] + ',' + $scope.fgcolor[0] + ', 255)');

                        file.editor.context.fillStyle = colorStops;
                        file.editor.context.fillRect(x, y, width, height);

                        $scope.selectedTool.options.prevYCoord = null;
                        $scope.selectedTool.options.prevXCoord = null;
                    }
                    else {
                        $scope.selectedTool.options.prevYCoord = yCoord;
                        $scope.selectedTool.options.prevXCoord = xCoord;
                    }
                }

                break;
        }

        $scope.Redraw();
    });

    $scope.Overlay_OnMouseMove = (function ($event, $index, file) {
        $event.preventDefault();
        $event.stopPropagation();

        var overlay = angular.element('div.propeditordialog div#' + file.name.substring(0, file.name.indexOf('.')) + ' canvas.overlay');
        var yCoord = ($event.originalEvent.clientY - overlay.offset().top) + windowElement.scrollTop();
        var xCoord = ($event.originalEvent.clientX - overlay.offset().left) + windowElement.scrollLeft();

        file.cursor.clearRect();

        if ($scope.selectedTool && (['Gradient', 'Color Picker', 'Rectangle Select', 'Ellipse Select', 'Crop', 'Text', 'Bucket Fill'].indexOf($scope.selectedTool.name) > -1 || $scope.selectedTool.options.size)) {
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
                        $scope.selectedFile.text.buffer = '';
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

                    file.editor.fillStyleRgba(color[1], color[2], color[0], 255);
                    file.editor.beginPath();
                    if ($scope.selectedTool.options.shape === 'square') {
                        file.editor.rect(xCoord - size, yCoord - size, size * 2, size * 2);
                    }
                    else if ($scope.selectedTool.options.shape === 'round') {
                        file.editor.arc(xCoord, yCoord, size, 0, PI2);
                    }
                    file.editor.fill();
                }

                break;
            case 'Color Picker':
                var pixel = file.editor.getPixelData(xCoord, yCoord);

                if ($scope.mouseButtonId === 1) {
                    $scope.bgcolor = pixel;
                }
                else if ($scope.mouseButtonId === 2) {
                    $scope.fgcolor = pixel;
                }

                break;
            case 'Rectangle Select':
                if ($scope.mouseButtonId === 1 && $scope.selectedTool.options.prevXCoord && $scope.selectedTool.options.prevXCoord > 0 && $scope.selectedTool.options.prevYCoord && $scope.selectedTool.options.prevYCoord > 0) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);

                    file.selectionmask.strokeStyleRgba(255, 255, 255, 255);
                    file.selectionmask.clearRect();
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
                    file.selectionmask.beginPath();
                    file.selectionmask.arc(prevXCoord, prevYCoord, radius, 0, PI2, false);
                    file.selectionmask.closePath();
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
                    var newHeight = Math.abs(yCoord - prevYCoord);
                    var newWidth = Math.abs(xCoord - prevXCoord);

                    file.cropmask.strokeStyleRgba(0, 0, 0, 255);
                    file.cropmask.fillStyleRgba(0, 0, 0, 0.5);
                    file.cropmask.clearRect();
                    file.cropmask.beginPath();
                    file.cropmask.rect(0, 0, file.cropmask.width(), file.cropmask.height());
                    file.cropmask.fill();

                    file.cropmask.clearRect(newWidth, newHeight, x, y);
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

                    //file.editor.strokeStyleRgba(color[1], color[2], color[0], opacity);
                    file.editor.fillStyleRgba(color[1], color[2], color[0], opacity);
                    file.editor.lineCap('round');
                    file.editor.lineJoin('round');
                    file.editor.lineWidth(0);

                    for (var i = 0; i < distance; i += 3) {
                        y = lastPoint.y + (Math.cos(angle) * i);
                        x = lastPoint.x + (Math.sin(angle) * i);

                        file.editor.beginPath();
                        file.editor.arc(x, y, size, false, PI2, false);
                        file.editor.fill();
                    }

                    $scope.selectedTool.options.prevYCoord = yCoord;
                    $scope.selectedTool.options.prevXCoord = xCoord;
                }

                break;
            case 'Blur':
                if ($scope.mouseButtonId === 1 || $scope.mouseButtonId === 2) {
                    var size = $window.parseInt($scope.selectedTool.options.size);
                    file.editor.drawImage(file.tempCanvas.canvas, xCoord, yCoord, size, size, xCoord, yCoord, size, size);
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

                    file.editor.drawImage(file.editor.canvas, xCoord, yCoord, size, size, xCoord + offsetX, yCoord + offsetY, size, size);
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
        var yCoord = ($event.originalEvent.clientY - overlay.offset().top) + windowElement.scrollTop();
        var xCoord = ($event.originalEvent.clientX - overlay.offset().left) + windowElement.scrollLeft();

        switch ($scope.selectedTool.name) {
            case 'Bucket Fill':
            case 'Airbrush':
            case 'Pencil':
            case 'Clone':
            case 'Blur':
                if ($scope.mouseButtonId === 1 || $scope.mouseButtonId === 2) {
                    $scope.SnapshotCanvas(file);
                }

                break;
            case 'Gradient':
                if ($scope.mouseButtonId === 1 && $scope.selectedTool.options.prevXCoord === null && $scope.selectedTool.options.prevYCoord === null) {
                    $scope.SnapshotCanvas(file);
                }

                break;
            case 'Rectangle Select':
                if ($scope.mouseButtonId === 1 || $scope.mouseButtonId === 2) {
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);
                    var y = prevYCoord < yCoord ? prevYCoord : yCoord;
                    var x = prevXCoord < xCoord ? prevXCoord : xCoord;
                    var newHeight = Math.abs(yCoord - prevYCoord);
                    var newWidth = Math.abs(xCoord - prevXCoord);

                    // TODO: Reset for now!!!
                    file.selectionmask.vortexes = [];

                    file.selectionmask.vortexes.push({ v: y, h: x });
                    file.selectionmask.vortexes.push({ v: y, h: x + newWidth });
                    file.selectionmask.vortexes.push({ v: y + newHeight, h: x + newWidth });
                    file.selectionmask.vortexes.push({ v: y + newHeight, h: x });
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

                    // TODO: Reset for now!!!
                    file.selectionmask.vortexes = [];

                    var radSq = Math.pow(radius, 2);

                    for (var x = -radius; x <= radius; x += 2) {
                        var y = Math.sqrt(radSq - Math.pow(x, 2));

                        if (y === 0 && Math.abs(x) !== radius) continue;

                        file.selectionmask.vortexes.push({ v: prevYCoord + y, h: prevXCoord + x });
                    }

                    for (var x = -radius; x <= radius; x += 2) {
                        var y = Math.sqrt(radSq - Math.pow(x, 2));

                        if (y === 0 && Math.abs(x) !== radius) continue;

                        file.selectionmask.vortexes.push({ v: prevYCoord - y, h: prevXCoord + x });
                    }
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
                    var imageData = file.editor.getImageData(x, y, newWidth, newHeight);

                    file.editor.height(newHeight);
                    file.editor.width(newWidth);
                    file.display.height(newHeight);
                    file.display.width(newWidth);
                    file.selectionmask.height(newHeight);
                    file.selectionmask.width(newWidth);
                    file.cropmask.height(newHeight);
                    file.cropmask.width(newWidth);
                    file.text.height(newHeight);
                    file.text.width(newWidth);
                    file.cursor.height(newHeight);
                    file.cursor.width(newWidth);
                    file.overlay.height(newHeight);
                    file.overlay.width(newWidth);

                    file.editor.clearRect();
                    file.editor.putImageData(0, 0, 0, 0, newWidth, newHeight, imageData);

                    $scope.SnapshotCanvas(file);
                }

                break;
            case 'Zoom':
                if ($scope.mouseButtonId === 1) {
                    file.editor.restore();
                }

                break;
            case 'Rectangle Select':
            case 'Ellipse Select':
            case 'Color Picker':

                break;
        }

        $scope.mouseButtonId = 0;

        $scope.Redraw();
    });

    $scope.Overlay_OnKeyDown = (function ($event) {
        if ($event) {
            switch ($event.originalEvent.keyCode) {
                case 8:
                    $scope.selectedFile.text.buffer = $scope.selectedFile.text.buffer.substring(0, $scope.selectedFile.text.buffer.length - 1);

                    break;
                case 13:
                    var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                    var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);
                    var size = $window.parseInt($scope.selectedTool.options.size);
                    var font = $scope.selectedTool.options.font;
                    var bgcolor = $scope.selectedFile.text.context.createLinearGradient(prevXCoord, prevYCoord, size, 0);
                    bgcolor.addColorStop(0, 'rgba(' + $scope.bgcolor[1] + ',' + $scope.bgcolor[2] + ',' + $scope.bgcolor[0] + ', 255)');
                    var fgcolor = $scope.selectedFile.text.context.createLinearGradient(prevXCoord, prevYCoord, size, 0);
                    fgcolor.addColorStop(0, 'rgba(' + $scope.fgcolor[1] + ',' + $scope.fgcolor[2] + ',' + $scope.fgcolor[0] + ', 255)');
                    $scope.selectedFile.editor.context.font = size + 'px ' + font;
                    $scope.selectedFile.editor.context.strokeStyle = bgcolor;
                    $scope.selectedFile.editor.context.fillStyle = fgcolor;
                    $scope.selectedFile.editor.context.fillText($scope.selectedFile.text.buffer, prevXCoord + $window.parseInt(size / 5), prevYCoord + size - $window.parseInt(size / 5));
                    $scope.selectedFile.editor.context.strokeText($scope.selectedFile.text.buffer, prevXCoord + $window.parseInt(size / 5), prevYCoord + size - $window.parseInt(size / 5));

                    $scope.SnapshotCanvas();
                    $scope.Redraw();

                    if ($event.originalEvent.shiftKey) {
                        var size = $window.parseInt($scope.selectedTool.options.size);

                        $scope.selectedTool.options.prevYCoord += size;
                    }
                    else {
                        $scope.selectedTool.options.prevYCoord = null;
                        $scope.selectedTool.options.prevXCoord = null;
                    }

                    $scope.selectedFile.text.buffer = '';

                    break;
                default:
                    var char = String.fromCharCode($event.originalEvent.keyCode).toLowerCase();

                    if ($event.originalEvent.shiftKey) {
                        char = char.toUpperCase();
                    }

                    $scope.selectedFile.text.buffer += char;

                    break;
            }
        }

        switch ($scope.selectedTool.name) {
            case 'Text':
                var prevYCoord = $window.parseInt($scope.selectedTool.options.prevYCoord);
                var prevXCoord = $window.parseInt($scope.selectedTool.options.prevXCoord);

                $scope.selectedFile.text.clearRect();

                if (!!prevXCoord && prevXCoord > 0 && !!prevYCoord && prevYCoord > 0) {
                    var size = $window.parseInt($scope.selectedTool.options.size);

                    $scope.selectedFile.text.lineWidth(1);
                    $scope.selectedFile.text.strokeStyleRgba(0, 0, 0, 255);

                    $scope.selectedFile.text.beginPath();
                    $scope.selectedFile.text.moveTo(prevXCoord, prevYCoord);
                    $scope.selectedFile.text.lineTo(prevXCoord, prevYCoord + size);
                    $scope.selectedFile.text.stroke();

                    var font = $scope.selectedTool.options.font;

                    $scope.selectedFile.text.lineWidth(1);
                    $scope.selectedFile.text.strokeStyleRgba(0, 0, 0, 255);

                    $scope.selectedFile.text.clearRect();
                    $scope.selectedFile.text.beginPath();
                    $scope.selectedFile.text.moveTo(prevXCoord, prevYCoord);
                    $scope.selectedFile.text.lineTo(prevXCoord, prevYCoord + size);
                    $scope.selectedFile.text.stroke();

                    var bgcolor = $scope.selectedFile.text.context.createLinearGradient(prevXCoord, prevYCoord, size, 0);
                    bgcolor.addColorStop(0, 'rgba(' + $scope.bgcolor[1] + ',' + $scope.bgcolor[2] + ',' + $scope.bgcolor[0] + ', 255)');
                    var fgcolor = $scope.selectedFile.text.context.createLinearGradient(prevXCoord, prevYCoord, size, 0);
                    fgcolor.addColorStop(0, 'rgba(' + $scope.fgcolor[1] + ',' + $scope.fgcolor[2] + ',' + $scope.fgcolor[0] + ', 255)');
                    $scope.selectedFile.text.context.font = size + 'px ' + font;
                    $scope.selectedFile.text.context.strokeStyle = bgcolor;
                    $scope.selectedFile.text.context.fillStyle = fgcolor;
                    $scope.selectedFile.text.context.fillText($scope.selectedFile.text.buffer, prevXCoord + $window.parseInt(size / 5), prevYCoord + size - $window.parseInt(size / 5));
                    $scope.selectedFile.text.context.strokeText($scope.selectedFile.text.buffer, prevXCoord + $window.parseInt(size / 5), prevYCoord + size - $window.parseInt(size / 5));
                }

                break;
        }
    });

    $scope.MenuOption_OnClick = (function ($event, option) {
        switch (option) {
            case 'FILE_OPEN':
                var filesCtrl = angular.element('div.propeditordialog input#files');

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
                if ($scope.selectedFile) {
                    //$scope.fileSave = $scope.selectedFile.editor.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:image/octet-stream');
                }

                break;
            case 'EDIT_UNDO':
                if ($scope.selectedFile && $scope.selectedFile.editorHistory.length > 1) {
                    $scope.selectedFile.editorHistory.splice($scope.selectedFile.editorHistory.length - 1, 1);

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
                if ($scope.selectedFile) {
                    dialogService.effectOptions({
                        canvas: $scope.selectedFile.editor,
                        effect: option,
                    }).then(function (response) {
                        if (response) {
                            $scope.selectedFile.editor.clearRect();
                            $scope.selectedFile.editor.drawImage(response.canvas, 0, 0);

                            $scope.SnapshotCanvas();
                        }
                    }, function (errors) {
                    });
                }

                break;
        }
    });

    $scope.SnapshotCanvas = (function (file) {
        var _file = file || $scope.selectedFile;

        if (_file) {
            var historyEntry = {
                image: new ImageObject({
                    sourceUrl: _file.editor.toDataURL(),
                }),
                canvasHeight: _file.overlay.height(),
                canvasWidth: _file.overlay.width(),
            }
            historyEntry.image.load();
            _file.editorHistory.push(historyEntry);
            _file.isDirty = true;
        }
    });

    $scope.Save_OnClick = (function ($event) {
        $scope.$close($scope.model);
    });
}]);
