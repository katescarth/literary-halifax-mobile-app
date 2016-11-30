angular.module('literaryHalifax')

.controller('menuCtrl', function($scope, $ionicSideMenuDelegate, $ionicHistory,
                                 $state, $ionicPlatform, mediaPlayer, $ionicPopover) {
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
    var exitOnBack = false
    
    $ionicPlatform.registerBackButtonAction(function(event) {
        if (exitOnBack) {
            $ionicPopup.confirm({
                title: 'System warning',
                template: 'are you sure you want to exit?'
            }).then(function(res) {
                if (res) {
                    ionic.Platform.exitApp();
                }
            })
        } else {
            goBack()
        }
    }, 100);

    toggleMenu = function(){
        $ionicSideMenuDelegate.toggleLeft()
    }

    goBack = function(){
        $ionicHistory.goBack()
    }
    setMenuMode = function(){
        $scope.navButtonIcon = 'ion-navicon'
        $scope.navButtonClick = toggleMenu
        exitOnBack=true
    }

    setBackMode = function(){
        // TODO Use the correct icon for the platform (ios or android)
        // or possibly animate for that #momentofcharm
        $scope.navButtonIcon = 'ion-chevron-left'
        $scope.navButtonClick = goBack
        exitOnBack=false
    }

    $scope.$root.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
        if(toState.title){
            $scope.navBarTitle = toState.title
            setMenuMode()
        } else {
            setBackMode()
        }
    })
    var popover = undefined
    $scope.audioButtonClass="button button-icon button-clear ion-volume-high pulse"
    $ionicPopover.fromTemplateUrl('components/mediaControl/mediaControl.html', {
            scope: $scope,
            animation:'in-from-right'
          }).then(function(constructedPopover){
            popover = constructedPopover
          });
    $scope.audioButtonClick = function($event){
      popover.show($event)
    }
    
    $scope.closePopover = function(){
        popover.hide()
    }
    
    $scope.media = mediaPlayer
    
    //the first state. Hacky
    $scope.navBarTitle = "Stories" //default state, there's no statechange to
    
    // The start state is always a base-level one
    setMenuMode()

}).controller('storiesCtrl', function($scope, $state, server){

    MAP_STATE='app.stories.map'
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

    //TODO should not run this at app start
    server.getStories(['name','location','id','images'])
    .then(function(result){
        $scope.places = result
    }).catch(function(error){
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
        } else if (toState.name==LIST_STATE) {
            $scope.mapButton = CLEAR_BUTTON
            $scope.listButton=FILLED_BUTTON
        }
    })



}).controller('storyCtrl',function($scope,$stateParams,server, $ionicTabsDelegate, $timeout, $ionicModal, mediaPlayer){

    $scope.story = undefined
    server.storyInfo($stateParams.storyID,['name','description','location','images','audio'])
    .then(function(placeAttrs){
        newStory = {
            id:$stateParams.storyID
        }
        
        for(attr in placeAttrs){
            newStory[attr] = placeAttrs[attr]
        }
        
        $scope.story = newStory
        $scope.places=[newStory]
        }, 
        function(error){
            console.log(error)
        })
    .then(function(){
        $timeout(function () {
            $ionicTabsDelegate.$getByHandle('story-tabs-delegate').select(0)
        }, 0);
    })
    
    
    //description tab
    $scope.playAudio = function(){
        mediaPlayer.setTrack($scope.story.audio, $scope.story.name)
        mediaPlayer.play()
    }

    //Images tab

    $ionicModal.fromTemplateUrl('components/imageView/imageView.html', {
        scope: $scope,
        animation: 'none'
    })
    .then(function(modal) {
        $scope.modal = modal;
    });


    openModal = function() {
        $scope.modal.show()
    }
    
    $scope.display = function(img){
        $scope.imageSrc = img
        $scope.imageAnimation="fade-appear"
        $scope.backgroundAnimation="frost-appear"
        // let the class register to avoid flicker
        $timeout().then(openModal)
    }
    $scope.closeModal = function() {
        $scope.imageAnimation="fade-disappear"
        $scope.backgroundAnimation="frost-disappear"
        // It takes 1 second to fade out
        $timeout(1000)
        .then(function(){
            $scope.modal.hide()
        })
    };



});
