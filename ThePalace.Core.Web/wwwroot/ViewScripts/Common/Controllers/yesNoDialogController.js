angular.module('ThePalace').controller('yesNoDialogController', ['$scope', 'text', function ($scope, text) {
    $scope.model =
    {
        confirmText: text,
    };
}]);
