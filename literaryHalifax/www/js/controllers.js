angular.module('literaryHalifax')

.controller('menuCtrl', function($scope, $ionicSideMenuDelegate, $window) {
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

  $scope.navBarTitle = "Stories" //default state, there's no statechange to
                                 //the first state. Hacky
  setMenuMode = function(){
    $scope.buttonClass = buttonClassPrefix+'ion-navicon'
    $scope.buttonClick = toggleMenu
  }

  setBackMode = function(){
    $scope.buttonClass = buttonClassPrefix+'ion-chevron-left'
    $scope.buttonClick = goBack
  }

  $scope.$root.$on('$stateChangeSuccess',
  function(event, toState, toParams, fromState, fromParams){
    if(toState.title){
      $scope.navBarTitle = toState.title
      setMenuMode()
    } else {
      setBackMode()
    }
    console.log(toState)
    console.log($ionicHistory.backView())
  })


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
