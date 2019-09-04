angular.module('ThePalace').controller('toolOptionsDialogController', ['$scope', '$window', 'model', function ($scope, $window, model) {
    $scope.model = model;

    $scope.ToolOptions_OnInit = (function () {

    });

    $scope.Save_OnClick = (function ($event) {
        $scope.$close({
            height: $scope.model.height,
            width: $scope.model.width,
        });
    });
}]);
