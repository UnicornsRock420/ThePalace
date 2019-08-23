angular.module('ThePalace').controller('clientSettingsDialogController', ['$scope', 'model', function ($scope, model) {
    $scope.model = model;

    $scope.Save_OnClick = (function ($event) {
        $scope.$close($scope.model);
    });
}]);
