angular.module('ThePalace').controller('appController', ['$scope', '$window', '$uibModal', 'dialogService', function ($scope, $window, $uibModal, dialogService) {
    $scope.model =
    {
        title: '',
    };

    $scope.setTitle = (function (value) {
        $window.document.title = $scope.model.title = value;
    });
}]);
