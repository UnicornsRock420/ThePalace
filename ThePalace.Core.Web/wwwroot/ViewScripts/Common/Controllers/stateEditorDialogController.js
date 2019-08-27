angular.module('ThePalace').controller('stateEditorDialogController', ['$scope', '$window', 'userInfo', 'pictureList', 'pictIDs', 'model', 'mvcEndPoints', 'dialogService', 'utilService', function ($scope, $window, userInfo, pictureList, pictIDs, model, mvcEndPoints, dialogService, utilService) {
    $scope.pictureList = utilService.ArrayClone(pictureList);
    $scope.userInfo = userInfo;
    $scope.pictIDs = pictIDs;
    $scope.model = model;

    $scope.stateFiles = [];
    $scope.browseFiles = [];
    $scope.recentFiles = [];
    $scope.browseFilesOffset = 0;

    $scope.filter = 'Images';
    $scope.orderby = 'LastModifiedDateDesc';
    $scope.overwrite = true;

    for (var j = 0; j < model.states.length; j++) {
        for (var k = 0; k < $scope.pictureList.length; k++) {
            if ($scope.pictureList[k].picID === model.states[j].pictID) {
                $scope.stateFiles.push($scope.pictureList[k].name);

                break;
            }
        }
    }

    $scope.DeleteState_OnClick = (function ($event, index) {
        var item = model.states[index];

        model.states.splice(index, 1);

        if (pictIDs.indexOf(item.pictID) === -1) {
            for (var j = 0; j < $scope.pictureList.length; j++) {
                if ($scope.pictureList[j].picID === item.pictID) {
                    $scope.pictureList.splice(j, 1);

                    break;
                }
            }
        }

        $scope.stateFiles = [];

        for (var j = 0; j < model.states.length; j++) {
            for (var k = 0; k < $scope.pictureList.length; k++) {
                if ($scope.pictureList[k].picID === model.states[j].pictID) {
                    $scope.stateFiles.push($scope.pictureList[k].name);

                    break;
                }
            }
        }
    });

    $scope.OrderState_OnClick = (function ($event, index, direction) {
        var item = model.states[index];

        model.states.splice(index, 1);

        model.states.splice(index + (direction ? -1 : 1), 0, item);

        $scope.stateFiles = [];

        for (var j = 0; j < model.states.length; j++) {
            for (var k = 0; k < $scope.pictureList.length; k++) {
                if ($scope.pictureList[k].picID === model.states[j].pictID) {
                    $scope.stateFiles.push($scope.pictureList[k].name);

                    break;
                }
            }
        }
    });

    $scope.AddFile_OnClick = (function ($event, fileName) {
        var isNew = !$scope.pictureList.length;
        var maxID = 0;

        for (var j = 0; j < $scope.pictureList.length; j++) {
            if ($scope.pictureList[j].name === fileName) {
                maxID = $scope.pictureList[j].picID;

                isNew = false;

                break;
            }
            else if ($scope.pictureList[j].picID >= maxID) {
                maxID = $scope.pictureList[j].picID + 1;

                isNew = true;
            }
        }

        if (isNew) {
            $scope.pictureList.push({
                picID: maxID,
                name: fileName,
                transColor: 0,
            });
        }

        $scope.model.states.push({
            pictID: maxID,
            picLoc: {
                h: 0,
                v: 0,
            },
        });

        $scope.stateFiles = [];

        for (var j = 0; j < model.states.length; j++) {
            for (var k = 0; k < $scope.pictureList.length; k++) {
                if ($scope.pictureList[k].picID === model.states[j].pictID) {
                    $scope.stateFiles.push($scope.pictureList[k].name);

                    break;
                }
            }
        }
    });

    $scope.DeleteFile_OnClick = (function ($event, fileName) {
        if ($scope.stateFiles.indexOf(fileName) > -1) {
            dialogService.showMessage('Sorry but that image is in use and cannot be deleted!');

            return;
        }

        dialogService.yesNo('Are you sure?').then(function (response) {
            if (response) {
                mvcEndPoints.MediaDelete($scope.userInfo.sessionHash, fileName)
                    .then(function (response) {
                        for (var j = 0; j < response.files.length; j++) {
                            var index = $scope.browseFiles.indexOf(response.files[j]);

                            if (index > -1) {
                                $scope.browseFiles.splice(index, 1);
                            }

                            var index = $scope.recentFiles.indexOf(response.files[j]);

                            if (index > -1) {
                                $scope.recentFiles.splice(index, 1);
                            }
                        }
                    }, function (errors) {
                        return;
                    });
            }
        }, function (errors) {
        })
    });

    $scope.Browse_OnClick = (function ($event) {
        $scope.browseFiles = [];
        $scope.browseFilesOffset = 0;

        mvcEndPoints.MediaIndex($scope.userInfo.sessionHash, $scope.filter, $scope.orderby, 1000, $scope.browseFilesOffset)
            .then(function (response) {
                for (var j = 0; j < response.files.length; j++) {
                    $scope.browseFiles.push(response.files[j]);
                }
            }, function (errors) {
                return;
            });
    });

    $scope.Next_OnClick = (function ($event) {
        $scope.browseFilesOffset += 1000;

        mvcEndPoints.MediaIndex($scope.userInfo.sessionHash, $scope.filter, $scope.orderby, 1000, $scope.browseFilesOffset)
            .then(function (response) {
                for (var j = 0; j < response.files.length; j++) {
                    $scope.browseFiles.push(response.files[j]);
                }
            }, function (errors) {
                return;
            });
    });

    $scope.Preview_OnClick = (function ($event, fileName) {
        $window.open('/media/' + fileName);
    });

    $scope.Upload_OnClick = (function ($event) {
        var files = angular.element('div.stateeditordialog input#files');

        files.click();

        if (files.length > 0) {
            var files = files.get(0).files;

            if (files.length > 0) {
                var data = new FormData();

                for (var j = 0; j < files.length; j++) {
                    data.append('files', files[j]);
                }

                mvcEndPoints.MediaUpload($scope.userInfo.sessionHash, data, $scope.overwrite)
                    .then(function (response) {
                        for (var j = 0; j < response.files.length; j++) {
                            $scope.recentFiles.push(response.files[j]);
                        }
                    }, function (errors) {
                        return;
                    });
            }
        }
    });

    $scope.Save_OnClick = (function ($event) {
        $scope.$close({
            state: $scope.model.state,
            states: $scope.model.states,
            pictureList: $scope.pictureList,
        });
    });
}]);
