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
                if (newVal && !newVal.images) {
                    $scope.loading = true
                    server.updateStory($scope.story, ['images'])
                    .finally(function (result) {
                        $scope.loading = false
                    })
                }
            })
        }]
    }
})