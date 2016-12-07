angular.module('literaryHalifax').directive('simpleInfoWindow', function () {
    return {
        scope: {
            landmark: '='
        }
        , templateUrl: 'components/infoWindows/simple.html'
        , controller: ['$scope','server', function ($scope, server) {
            
            $scope.loading=false
            
            refresh = function(){
                $scope.loading=true
                server.updateLandmark($scope.landmark, ['name','description'])
                .finally(function(){
                    $scope.loading=false
                })
            }
            
            var limit = 140
            $scope.title=function(){
                if($scope.landmark){
                    return $scope.landmark.name
                }
            }
            $scope.truncatedDescription=function(){
                if(!$scope.landmark||!$scope.landmark.description){
                    return ''
                }
                str = $scope.landmark.description[0]
                if(str.length>limit){
                    str=str.substr(0,136)+'...'
                }
                return str
            }
            $scope.$watch('landmark', function (newVal, oldVal) {
                if(newVal&&!(newVal.name&&newVal.description)){
                    refresh()
                }
            })
        }]
    }
})