angular.module('ThePalace').controller('roomInfoDialogController', ['$scope', 'model', 'RoomFlags', function ($scope, model, RoomFlags) {
    $scope.model = model;

    $scope.flags = {};

    if (($scope.model.flags & RoomFlags.RF_Private) != 0) {
        $scope.flags.Private = true;
    }

    if (($scope.model.flags & RoomFlags.RF_NoPainting) != 0) {
        $scope.flags.NoPainting = true;
    }

    if (($scope.model.flags & RoomFlags.RF_CyborgFreeZone) != 0) {
        $scope.flags.NoScripts = true;
    }

    if (($scope.model.flags & RoomFlags.RF_Hidden) != 0) {
        $scope.flags.Hidden = true;
    }

    if (($scope.model.flags & RoomFlags.RF_WizardsOnly) != 0) {
        $scope.flags.StaffOnly = true;
    }

    if (($scope.model.flags & RoomFlags.RF_DropZone) != 0) {
        $scope.flags.DropZone = true;
    }

    $scope.Save_OnClick = (function ($event) {
        $scope.model.flags = 0;

        if ($scope.flags.Private) {
            $scope.model.flags |= RoomFlags.RF_Private;
        }

        if ($scope.flags.NoPainting) {
            $scope.model.flags |= RoomFlags.RF_NoPainting;
        }

        if ($scope.flags.NoScripts) {
            $scope.model.flags |= RoomFlags.RF_CyborgFreeZone;
        }

        if ($scope.flags.Hidden) {
            $scope.model.flags |= RoomFlags.RF_Hidden;
        }

        if ($scope.flags.StaffOnly) {
            $scope.model.flags |= RoomFlags.RF_WizardsOnly;
        }

        if ($scope.flags.DropZone) {
            $scope.model.flags |= RoomFlags.RF_DropZone;
        }

        $scope.$close($scope.model);
    });
}]);
