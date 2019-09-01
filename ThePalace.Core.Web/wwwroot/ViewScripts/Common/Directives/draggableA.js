angular.module('ThePalace').directive('draggable', ['$document', '$compile', '$window', function ($document, $compile, $window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var startX = 0, startY = 0, x = 0, y = 0;

            var mousemove = function ($event) {
                var windowElement = angular.element($window);
                x = ($event.originalEvent.clientX - element.prop('offsetLeft')) + windowElement.scrollLeft() - startX;
                y = ($event.originalEvent.clientY - element.prop('offsetTop')) + windowElement.scrollTop() - startY;

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
                left: '0px',
                top: '0px',
            });

            element.css({
                backgroundColor: 'lightgray',
                border: '1px solid darkgray',
                cursor: 'pointer',
            });

            element.on('mousedown', function ($event) {
                // Prevent default dragging of selected content
                $event.preventDefault();

                var windowElement = angular.element($window);
                startX = ($event.originalEvent.clientX - element.prop('offsetLeft')) + windowElement.scrollLeft() - x;
                startY = ($event.originalEvent.clientY - element.prop('offsetTop')) + windowElement.scrollTop() - y;

                if (y < 0) {
                    y = 0;
                }

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
