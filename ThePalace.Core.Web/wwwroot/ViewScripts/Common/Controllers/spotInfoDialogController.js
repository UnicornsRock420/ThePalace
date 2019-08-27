angular.module('ThePalace').controller('spotInfoDialogController', ['$scope', 'userInfo', 'roomList', 'pictureList', 'pictIDs', 'model', 'dialogService', 'HotSpotFlags', 'HotSpotTypes', function ($scope, userInfo, roomList, pictureList, pictIDs, model, dialogService, HotSpotFlags, HotSpotTypes) {
    $scope.spotTypes = HotSpotTypes;
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

    $scope.ScriptEditor_OnClick = (function ($event) {
        dialogService.scriptEditor({
            script: $scope.model.script,
        }).then(function (response) {
            if (response) {
                $scope.model.script = response.script;
            }
        }, function (errors) {
        });
    });

    $scope.StateEditor_OnClick = (function ($event) {
        dialogService.stateEditor(
            userInfo,
            pictureList,
            pictIDs,
            {
                state: $scope.model.state,
                states: $scope.model.states,
            }).then(function (response) {
                if (response) {
                    $scope.model.state = response.state;
                    $scope.model.states = response.states;

                    pictureList.splice(0);

                    for (var j = 0; j < response.pictureList.length; j++) {
                        pictureList.push(response.pictureList[j]);
                    }
                }
            }, function (errors) {
            });
    });

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

        $scope.$close({
            id: $scope.model.id,
            type: $scope.model.type,
            state: $scope.model.state,
            states: $scope.model.states,
            script: $scope.model.script,
            name: $scope.model.name,
            loc: $scope.model.loc,
            dest: $scope.model.dest,
            flags: $scope.model.flags,
            pictureList: pictureList,
        });
    });
}]);
