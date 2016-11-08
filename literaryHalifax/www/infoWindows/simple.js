angular.module('literaryHalifax')

.directive('simpleInfoWindow', function(){
  return {
    scope: {
      place:'='
    },
    templateUrl:'infoWindows/simple.html',
    controller: ['$scope',function($scope){
      $scope.boop=function(){
        console.log('boop')
      }
    }]
  }
})

.controller('infoWindowCtrl',function($scope){
  $scope.boop=function(){
    console.log('boop')
  }
})
