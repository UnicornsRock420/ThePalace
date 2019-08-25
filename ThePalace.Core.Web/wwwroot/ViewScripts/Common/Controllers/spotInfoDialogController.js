angular.module('ThePalace').controller('spotInfoDialogController', ['$scope', 'roomList', 'model', 'HotSpotFlags', function ($scope, roomList, model, HotSpotFlags) {
    $scope.roomList = roomList;
    $scope.model = model;

    $scope.flags = {};

    if (($scope.model.flags & HotSpotFlags.HF_Draggable) != 0) {
        $scope.flags.Draggable = true;
    }

    if (($scope.model.flags & HotSpotFlags.HF_DontMoveHere) != 0) {
        $scope.flags.DontMoveHere = true;
    }

    if (($scope.model.flags & HotSpotFlags.HF_Invisible) != 0) {
        $scope.flags.Invisible = true;
    }

    if (($scope.model.flags & HotSpotFlags.HF_ShowFrame) != 0) {
        $scope.flags.ShowFrame = true;
    }

    if (($scope.model.flags & HotSpotFlags.HF_Shadow) != 0) {
        $scope.flags.Shadow = true;
    }

    if (($scope.model.flags & HotSpotFlags.HF_Fill) != 0) {
        $scope.flags.Fill = true;
    }

    if (($scope.model.flags & HotSpotFlags.HF_Forbidden) != 0) {
        $scope.flags.Forbidden = true;
    }

    if (($scope.model.flags & HotSpotFlags.HF_Mandatory) != 0) {
        $scope.flags.Mandatory = true;
    }

    if (($scope.model.flags & HotSpotFlags.HF_LandingPad) != 0) {
        $scope.flags.LandingPad = true;
    }

    $scope.Save_OnClick = (function ($event) {
        $scope.model.flags = 0;

        if ($scope.flags.Draggable) {
            $scope.model.flags |= HotSpotFlags.HF_Draggable;
        }

        if ($scope.flags.DontMoveHere) {
            $scope.model.flags |= HotSpotFlags.HF_DontMoveHere;
        }

        if ($scope.flags.Invisible) {
            $scope.model.flags |= HotSpotFlags.HF_Invisible;
        }

        if ($scope.flags.ShowFrame) {
            $scope.model.flags |= HotSpotFlags.HF_ShowFrame;
        }

        if ($scope.flags.Shadow) {
            $scope.model.flags |= HotSpotFlags.HF_Shadow;
        }

        if ($scope.flags.Fill) {
            $scope.model.flags |= HotSpotFlags.HF_Fill;
        }

        if ($scope.flags.Forbidden) {
            $scope.model.flags |= HotSpotFlags.HF_Forbidden;
        }

        if ($scope.flags.Mandatory) {
            $scope.model.flags |= HotSpotFlags.HF_Mandatory;
        }

        if ($scope.flags.LandingPad) {
            $scope.model.flags |= HotSpotFlags.HF_LandingPad;
        }

        $scope.$close($scope.model);
    });
}]);
