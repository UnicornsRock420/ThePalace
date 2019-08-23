angular.module('ThePalace').controller('messageDialogController', ['$scope', 'text', function ($scope, text) {
    $scope.model =
    {
        confirmText: text,
    };
}]);
