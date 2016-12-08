angular.module('dotdotdot-angular', [])
    .directive('dotdotdot', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {

                // We must pass in the scope binding, e.g. dotdotdot='myText' for scope.myText
                scope.$watch(attributes.dotdotdot, function() {

                    // Wait for DOM to render
                    // NB. Don't use { watch: true } option in dotdotdot as it needlessly polls
                    $timeout(function() {
                        element.dotdotdot();
                    }, 400);
                });
            }
        }
}]);
