/*global angular */
angular.module('literaryHalifax')
    /*
     * Displays a spinner and loading message if a loading message is provided.
     * Displays a red X and error message if an error message is provided.
     * calls the 'refresh' function when the red X is tapped
     * Disappears if no messages are provided. 
     */
    .directive('asyncToggle', function () {
        "use strict";
        return {
            restrict : 'E',
            scope: {
                changing: '=',
                active: '=',
                switchOn: '=',
                switchOff: '='
            },
            templateUrl : 'components/asyncToggle/asyncToggle.html'
        };
    })

    .controller("asyncToggleCtrl", function ($scope, $log) {
        "use strict";
        $scope.onClick = function () {
            if ($scope.active) {
                $scope.switchOff();
            } else {
                $scope.switchOn();
            }
        };

        $scope.labelClass = function () {
            if ($scope.changing) {
                return "async-toggle-working";
            } else if ($scope.active) {
                return "async-toggle-on";
            }
            return "";
        };
    
    });