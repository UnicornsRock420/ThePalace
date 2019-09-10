angular.module('ThePalace').controller('toolOptionsDialogController', ['$scope', '$window', 'model', function ($scope, $window, model) {
    $scope.model = model;

    $scope.ToolOptions_OnInit = (function () {
        $scope.model.ratio = true;

        $scope.model.beforeHeight = $window.parseInt($scope.model.height);
        $scope.model.beforeWidth = $window.parseInt($scope.model.width);

        if ($scope.model.override) {
            if ($scope.model.height > $scope.model.width) {
                $scope.model.height = $scope.model.override.height;

                $scope.Dimensions_OnChange(null, 'HEIGHT');
            }
            else {
                $scope.model.width = $scope.model.override.width;

                $scope.Dimensions_OnChange(null, 'WIDTH');
            }
        }
    });

    $scope.Dimensions_OnChange = (function ($event, mode) {
        if (!$scope.model.ratio) return;

        switch (mode) {
            case 'HEIGHT':
                $scope.model.height = $window.parseInt($scope.model.height);

                var ratio = ($scope.model.height / $scope.model.beforeHeight);

                $scope.model.width = $window.parseInt($scope.model.beforeWidth * ratio);

                break;
            case 'WIDTH':
                $scope.model.width = $window.parseInt($scope.model.width);

                var ratio = ($scope.model.width / $scope.model.beforeWidth);

                $scope.model.height = $window.parseInt($scope.model.beforeHeight * ratio);

                break;
        }
    });

    $scope.Save_OnClick = (function ($event) {
        $scope.$close({
            height: $scope.model.height,
            width: $scope.model.width,
        });
    });
}]);
