angular.module('literaryHalifax').directive('imageInfoWindow', function () {
    return {
        scope: {
            story: '='
        }
        , templateUrl: 'components/infoWindows/image.html'
        , controller: ['$scope', function ($scope) {
            $scope.imageSrc = undefined
            $scope.loading = true
            $scope.$watch('story', function (newVal, oldVal) {
                console.log($scope.story)
                if (newVal && !newVal.images) {
                    $scope.loading = true
                    server.storyInfo(newVal.id, ['images']).then(function (result) {
                        $scope.story.images = result.images
                        console.log($scope.story)
                        $scope.loading = false
                    })
                }
            })
            $scope.$watch('story.images', function (newVal, oldVal) {
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