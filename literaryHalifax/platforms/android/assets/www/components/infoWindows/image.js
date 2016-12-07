angular.module('literaryHalifax').directive('imageInfoWindow', function () {
    return {
        scope: {
            landmark: '='
        }
        , templateUrl: 'components/infoWindows/image.html'
        , controller: ['$scope', function ($scope) {
            $scope.imageSrc = undefined
            $scope.loading = true
            $scope.$watch('landmark', function (newVal, oldVal) {
                if (newVal && !newVal.images) {
                    $scope.loading = true
                    server.updateLandmark($scope.landmark, ['images'])
                    .finally(function (result) {
                        $scope.loading = false
                    })
                }
            })
        }]
    }
})