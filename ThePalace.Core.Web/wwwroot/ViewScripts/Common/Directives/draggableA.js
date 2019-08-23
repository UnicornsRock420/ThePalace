angular.module('ThePalace').directive('draggable', ['$document', '$compile', function ($document, $compile) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var startX = 0, startY = 0, x = 0, y = 0;

            var mousemove = function (event) {
                y = event.pageY - startY;
                x = event.pageX - startX;

                if (y < 0) {
                    y = 0;
                }

                element.parent().css({
                    left: x + 'px',
                    top: y + 'px',
                });
            }

            var mouseup = function () {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }

            element.parent().css({
                backgroundColor: 'lightgray',
                position: 'absolute',
            });

            element.css({
                backgroundColor: 'lightgray',
                border: '1px solid green',
                cursor: 'pointer',
            });

            element.on('mousedown', function (event) {
                // Prevent default dragging of selected content
                event.preventDefault();

                startX = event.pageX - x;
                startY = event.pageY - y;

                element.parent().css({
                    left: x + 'px',
                    top: y + 'px',
                });

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });
        }
    };
}]);
