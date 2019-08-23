angular.module('ThePalace').controller('errorDialogController', ['$scope', '$sce', 'errors', function ($scope, $sce, errors) {
    $scope.model =
    {
        errors: '',
    };

    $scope.model.errors = $sce.trustAsHtml(errors);
}]);
