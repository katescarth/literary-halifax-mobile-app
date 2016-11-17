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

  MAP_STATE  =  'app.stories.map'
  LIST_STATE = 'app.stories.list'
  CLEAR_BUTTON= "button button-full button-outline button-balanced"
  FILLED_BUTTON= "button button-full button-balanced"

  $scope.mapButton = FILLED_BUTTON
  $scope.listButton=CLEAR_BUTTON

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
    $state.go(MAP_STATE)
  }

  $scope.toListTab = function(){
    $state.go(LIST_STATE)
  }

  $scope.$root.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
      if (toState.name==MAP_STATE) {
        $scope.mapButton = FILLED_BUTTON
        $scope.listButton=CLEAR_BUTTON
      } else if (toState.name=LIST_STATE) {
        $scope.mapButton = CLEAR_BUTTON
        $scope.listButton=FILLED_BUTTON
      }
    }
  )



});
