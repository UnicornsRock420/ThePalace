angular.module('ThePalace').service('dialogService', ['$q', '$uibModal', function ($q, $uibModal) {
    this.showErrorDialog = (function (text, error) {
        var deferred = $q.defer();
        var errorMessage;

        if (!error) {
            errorMessage = text;
        }
        else if (error.data) {
            if (error.data.message) {
                errorMessage = error.data.message;
            }
            else if (Array.isArray(error.data)) {
                var message = '<ul class="error-list">';

                for (var idx = 0; idx < error.data.length; idx++) {
                    var currentItem = error.data[idx];

                    message += '<li class="error-list-item">' + currentItem.ErrorMessage + '</li>';
                }

                message += '</ul>';

                errorMessage = message;
            }
            else {
                errorMessage = text;
            }
        }
        else {
            errorMessage = 'There was an error.';
        }

        var instance = $uibModal.open({
            size: 'sm',
            animation: false,
            backdrop: 'static',
            controller: 'errorDialogController',
            templateUrl: '/ViewScripts/Common/Views/errorDialog.html',
            resolve: {
                errors: function () {
                    return errorMessage;
                }
            }
        });

        instance.result.then(function (result) {
            deferred.resolve(result);
        }, function (result) {
            deferred.reject(result);
        });

        return deferred.promise;
    });

    this.showMessage = (function (message) {
        var deferred = $q.defer();
        var instance = $uibModal.open({
            size: 'sm',
            animation: false,
            backdrop: 'static',
            controller: 'messageDialogController',
            templateUrl: '/ViewScripts/Common/Views/messageDialog.html',
            resolve: {
                text: function () {
                    return message;
                }
            }
        });

        instance.result.then(function (result) {
            deferred.resolve(result);
        }, function (result) {
            deferred.reject(result);
        });

        return deferred.promise;
    });

    this.confirm = (function (message) {
        var deferred = $q.defer();
        var instance = $uibModal.open({
            size: 'sm',
            animation: false,
            backdrop: 'static',
            controller: 'confirmDialogController',
            templateUrl: '/ViewScripts/Common/Views/confirmDialog.html',
            resolve: {
                text: function () {
                    return message;
                }
            }
        });

        instance.result.then(function (result) {
            deferred.resolve(result);
        }, function (result) {
            deferred.reject(result);
        });

        return deferred.promise;
    });

    this.yesNo = (function (message) {
        var deferred = $q.defer();
        var instance = $uibModal.open({
            size: 'sm',
            animation: false,
            backdrop: 'static',
            controller: 'yesNoDialogController',
            templateUrl: '/ViewScripts/Common/Views/yesNoDialog.html',
            resolve: {
                text: function () {
                    return message;
                }
            }
        });

        instance.result.then(function (result) {
            deferred.resolve(result);
        }, function (result) {
            deferred.reject(result);
        });

        return deferred.promise;
    });

    this.clientSettings = (function (model) {
        var deferred = $q.defer();
        var instance = $uibModal.open({
            size: 'lg',
            animation: false,
            backdrop: 'static',
            controller: 'clientSettingsDialogController',
            templateUrl: '/ViewScripts/Common/Views/clientSettingsDialog.html',
            resolve: {
                model: function () {
                    return model;
                }
            }
        });

        instance.result.then(function (result) {
            deferred.resolve(result);
        }, function (result) {
            deferred.reject(result);
        });

        return deferred.promise;
    });
}]);
