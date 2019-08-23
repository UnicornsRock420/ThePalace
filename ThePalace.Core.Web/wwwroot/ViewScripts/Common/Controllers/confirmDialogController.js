angular.module('ThePalace').controller('confirmDialogController', ['$scope', 'text', function ($scope, text) {
    $scope.model =
    {
        confirmText: text,
    };
}]);
