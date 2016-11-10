angular.module('literaryHalifax')

.controller('menuCtrl', function($scope, $ionicSideMenuDelegate) {
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

  $scope.toggleMenu = function(){
    $ionicSideMenuDelegate.toggleLeft();
  }
}).controller('storiesCtrl', function($scope, server){

  $scope.mapInfo = {
    center:"44.6474,-63.5806",
    zoom: 15
  }
  $scope.places = []
  server.getPlaces().then(
    function(result){
      $scope.places = result
    }
  ).catch(function(error){
    console.log(error)
  })
});
