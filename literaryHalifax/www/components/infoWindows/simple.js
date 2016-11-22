angular.module('literaryHalifax')

.directive('simpleInfoWindow', function(){
  return {
    scope: {
      place:'='
    },
    templateUrl:'components/infoWindows/simple.html',
    controller: ['$scope',function($scope, server){

    }]
  }
})
