angular.module('literaryHalifax').directive('simpleInfoWindow', function () {
    return {
        scope: {
            story: '='
        }
        , templateUrl: 'components/infoWindows/simple.html'
        , controller: ['$scope','server', function ($scope, server) {
            
            $scope.loading=false
            
            refresh = function(){
                $scope.loading=true
                server.storyInfo($scope.story.id, ['name','description'])
                .then(function(result){
                    angular.extend($scope.story,result)
                }).finally(function(){
                    $scope.loading=false
                })
            }
            
            var limit = 140
            $scope.title=function(){
                if($scope.story){
                    return $scope.story.name
                }
            }
            $scope.truncatedDescription=function(){
                if(!$scope.story||!$scope.story.description){
                    return ''
                }
                str = $scope.story.description[0]
                if(str.length>limit){
                    str=str.substr(0,136)+'...'
                }
                return str
            }
            $scope.$watch('story', function (newVal, oldVal) {
                if(newVal&&!(newVal.name&&newVal.description)){
                    refresh()
                }
            })
        }]
    }
})