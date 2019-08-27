angular.module('ThePalace').controller('scriptEditorDialogController', ['$scope', 'model', function ($scope, model) {
    $scope.model = model;

    $scope.Save_OnClick = (function ($event) {
        $scope.$close($scope.model);
    });
}]);
