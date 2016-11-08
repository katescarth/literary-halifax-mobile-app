angular.module('literaryHalifax')

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  $scope.menuItems =[
    {
      displayName:'Stories',
      href:'#/app/stories'
    },
    {
      displayName:'Tours',
      href:'#/app/tours'
    },
    {
      displayName:'Browse by Topic',
      href:'#/app/browseByTopic'
    },
    {
      displayName:'About',
      href:'#/app/about'
    }
  ]
}).controller('storiesCtrl', function($scope){

  $scope.mapInfo = {
    center:"44.6474,-63.5806",
    zoom: 15
  }
  //simple dummy data
  $scope.places = [
    {
      name:"Halifax Central Library",
      location:"44.6431,-63.5752",
      id: "place-id-1"
    },
    {
      name:"Public Gardens",
      location:"44.6428,-63.5821",
      id: "place-id-2"
    },
    {
      name:"The Dingle",
      location:"44.6304,-63.6028",
      id: "place-id-3"
    }
  ]
});
