angular.module('literaryHalifax')

.controller('menuCtrl', function($scope, $ionicSideMenuDelegate, $window, $ionicHistory) {
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

  toggleMenu = function(){
    $ionicSideMenuDelegate.toggleLeft()
  }

  goBack = function(){
    $window.history.back()
  }

  buttonClassPrefix = "button button-icon button-clear "

  setMenuMode = function(){
    $scope.buttonClass = buttonClassPrefix+'ion-navicon'
    $scope.buttonClick = toggleMenu
  }

  setBackMode = function(){
    // TODO Use the correct icon for the platform (ios or android)
    // or possibly animate for that #momentofcharm
    $scope.buttonClass = buttonClassPrefix+'ion-chevron-left'
    $scope.buttonClick = goBack
  }

  $scope.$root.$on('$stateChangeSuccess',
  function(event, toState, toParams, fromState, fromParams){
    if(toState.title){
      $ionicHistory.clearHistory() // prevent physical back  buttons from going
                                   // back
      $scope.navBarTitle = toState.title
      setMenuMode()
    } else {
      setBackMode()
    }
  })
  $scope.navBarTitle = "Stories" //default state, there's no statechange to
                                 //the first state. Hacky
  // The start state is always a base-level one
  setMenuMode()

}).controller('storiesCtrl', function($scope, $state, server){

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

  $scope.toMapTab = function(){
    $state.go('app.stories.map')
  }

  $scope.toListTab = function(){
    $state.go('app.stories.list')
  }





});
