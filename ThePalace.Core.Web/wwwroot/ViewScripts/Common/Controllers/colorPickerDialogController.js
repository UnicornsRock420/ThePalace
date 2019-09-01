angular.module('ThePalace').controller('colorPickerDialogController', ['$scope', '$window', 'model', 'CanvasNode', 'ImageObject', function ($scope, $window, model, CanvasNode, ImageObject) {
    $scope.model = model;
    $scope.hueLevel = -9;
    $scope.pickerXCoord = 0;
    $scope.pickerYCoord = 0;
    $scope.pickerPixel = $scope.model.color;
    $scope.huePixel = [255, 255, 255, 255];
    $scope.pickerLoc = {
        v: 0,
        h: 0,
    };

    $scope.ColorPicker_OnInit = (function () {
        $scope.pickerNode = new CanvasNode('2d');
        $scope.hueNode = new CanvasNode('2d');

        var style = $window.getComputedStyle(angular.element('div.colorpickerdialog div#pickermask').get(0), null);
        var path = style.getPropertyValue('background-image');
        path = path.substring(5, path.length - 2);

        $scope.pickerImage = new ImageObject({
            sourceUrl: path,
            resolve: function (response) {
                $scope.pickerNode.height(this.height);
                $scope.pickerNode.width(this.width);
            },
        });
        $scope.pickerImage.load();

        var style = $window.getComputedStyle(angular.element('div.colorpickerdialog div#huebg').get(0), null);
        var path = style.getPropertyValue('background-image');
        path = path.substring(5, path.length - 2);

        var tempImage = new ImageObject({
            sourceUrl: path,
            resolve: function (response) {
                $scope.hueNode.height(this.height);
                $scope.hueNode.width(this.width);

                $scope.hueNode.drawImage(tempImage.image, 0, 0, this.width, this.height);
            },
        });
        tempImage.load();
    });

    $scope.PickerThumb_OnMouseMove = (function ($event) {
        if ($event.originalEvent.buttons === 1) {
            var windowElement = angular.element($window);
            var elem = angular.element('div.colorpickerdialog div#pickermask');
            var xCoord = ($event.originalEvent.clientX - elem.offset().left) + windowElement.scrollLeft();
            var yCoord = ($event.originalEvent.clientY - elem.offset().top) + windowElement.scrollTop();

            angular.element('div.colorpickerdialog div#pickermask').css('background-color', 'rgb(' + $scope.huePixel[1] + ',' + $scope.huePixel[2] + ',' + $scope.huePixel[0] + ')');

            $scope.pickerNode.clearRect();

            $scope.pickerNode.strokeStyleRgba($scope.huePixel[1], $scope.huePixel[2], $scope.huePixel[0], 1);
            $scope.pickerNode.fillStyleRgba($scope.huePixel[1], $scope.huePixel[2], $scope.huePixel[0], 1);

            $scope.pickerNode.moveTo(0, 0);
            $scope.pickerNode.lineTo(0, $scope.pickerNode.height());
            $scope.pickerNode.lineTo($scope.pickerNode.width(), $scope.pickerNode.height());
            $scope.pickerNode.lineTo($scope.pickerNode.width(), 0);
            $scope.pickerNode.lineTo(0, 0);

            $scope.pickerNode.stroke();
            $scope.pickerNode.fill();

            $scope.pickerNode.drawImage($scope.pickerImage.image, 0, 0, $scope.pickerNode.width(), $scope.pickerNode.height());

            $scope.pickerXCoord = xCoord;
            $scope.pickerYCoord = yCoord;
            $scope.pickerPixel = $scope.pickerNode.getPixelData($scope.pickerXCoord, $scope.pickerYCoord);
            $scope.pickerLoc = {
                v: yCoord - 4,
                h: xCoord - 4,
            };
        }
    });

    $scope.HueThumb_OnMouseMove = (function ($event) {
        if ($event.originalEvent.buttons === 1) {
            var windowElement = angular.element($window);
            var elem = angular.element('div.colorpickerdialog div#huebg');
            var xCoord = ($event.originalEvent.clientX - elem.offset().left) + windowElement.scrollLeft();
            var yCoord = ($event.originalEvent.clientY - elem.offset().top) + windowElement.scrollTop();

            $scope.huePixel = $scope.hueNode.getPixelData(xCoord, yCoord);
            angular.element('div.colorpickerdialog div#pickermask').css('background-color', 'rgb(' + $scope.huePixel[1] + ',' + $scope.huePixel[2] + ',' + $scope.huePixel[0] + ')');

            $scope.pickerNode.clearRect();

            $scope.pickerNode.strokeStyleRgba($scope.huePixel[1], $scope.huePixel[2], $scope.huePixel[0], 1);
            $scope.pickerNode.fillStyleRgba($scope.huePixel[1], $scope.huePixel[2], $scope.huePixel[0], 1);

            $scope.pickerNode.moveTo(0, 0);
            $scope.pickerNode.lineTo(0, $scope.pickerNode.height());
            $scope.pickerNode.lineTo($scope.pickerNode.width(), $scope.pickerNode.height());
            $scope.pickerNode.lineTo($scope.pickerNode.width(), 0);
            $scope.pickerNode.lineTo(0, 0);

            $scope.pickerNode.stroke();
            $scope.pickerNode.fill();

            $scope.pickerNode.drawImage($scope.pickerImage.image, 0, 0, $scope.pickerNode.width(), $scope.pickerNode.height());

            $scope.pickerPixel = $scope.pickerNode.getPixelData($scope.pickerXCoord, $scope.pickerYCoord);
            $scope.hueLevel = (yCoord % 183) - 9;
        }
    });

    $scope.Save_OnClick = (function ($event) {
        $scope.$close({
            color: $scope.pickerPixel,
        });
    });
}]);
