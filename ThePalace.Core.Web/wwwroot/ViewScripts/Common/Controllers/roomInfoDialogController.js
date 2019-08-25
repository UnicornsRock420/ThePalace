angular.module('ThePalace').controller('roomInfoDialogController', ['$scope', 'model', function ($scope, model) {
    $scope.model = model;

    $scope.Save_OnClick = (function ($event) {
        $scope.$close($scope.model);
    });
}]);
