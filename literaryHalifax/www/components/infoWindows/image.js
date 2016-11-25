angular.module('literaryHalifax').directive('imageInfoWindow', function () {
    return {
        scope: {
            place: '='
        }
        , templateUrl: 'components/infoWindows/image.html'
        , controller: ['$scope', function ($scope) {
            $scope.imageSrc = undefined
            $scope.loading = true
            $scope.$watch('place', function (newVal, oldVal) {
                if (newVal && !newVal.images) {
                    $scope.loading = true
                    server.storyInfo(newVal.id, ['images']).then(function (result) {
                        $scope.place.images = result.images
                        console.log($scope.place)
                        $scope.loading = false
                    })
                }
            })
            $scope.$watch('place.images', function (newVal, oldVal) {
                if (!newVal) {
                    $scope.imageSrc = undefined
                    return
                }
                if (newVal != $scope.imageSrc) {
                    $scope.imageSrc = newVal[0]
                }
            })
}]
    }
})