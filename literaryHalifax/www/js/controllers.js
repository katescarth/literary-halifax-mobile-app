angular.module('literaryHalifax')

.controller('menuCtrl', function($scope, $ionicSideMenuDelegate, $ionicHistory, $ionicPopup,
                                 $state, $ionicPlatform, mediaPlayer, $ionicPopover) {
    // items for the side menu
    $scope.menuItems =[
        {
            displayName:'Stories',
            state:'app.stories'
        },
        {
            displayName:'Tours',
            state:'app.tours'
        },
        {
            displayName:'Browse by Topic',
            state:'app.browseByTopic'
        },
        {
            displayName:'About',
            state:'app.about'
        }
    ]
    // take control of back button when it tries to navigate back
    // (not when it closes popups, etc.)
    $ionicPlatform.registerBackButtonAction(function(event) {
        if ($scope.menuMode) {
            $ionicPopup.confirm({
                title: 'Leave app?',
                template: ''
            }).then(function(res) {
                if (res) {
                    ionic.Platform.exitApp();
                }
            })
        } else {
            goBack()
        }
    }, 100);

    $scope.navButtonClick=function(){
        if($scope.menuMode){
            toggleMenu()
        }
        else{
            goBack()
        }
    }
    menuOpen=false
    toggleMenu = function(){
        menuOpen=!menuOpen
        if(menuOpen){
            $scope.menuClass = 'slideRight'
        } else {
            $scope.menuClass = 'slideLeft'
        }
    }
    
    $scope.menuItemClick=function(item){
        $ionicHistory.nextViewOptions({
            disableAnimate: true
        });
        $state.go(item.state)
        if(menuOpen){
            toggleMenu()
        }
    }

    goBack = function(){
        $ionicHistory.goBack()
    }
    

    // check every state change and update navbar accordingly
    $scope.$root.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
        if(toState.title){
            $scope.navBarTitle = toState.title
            $scope.menuMode=true
        } else {
            $scope.menuMode=false
        }
    })
    
    //default state, there's no statechange to
    //the first state. Hacky
    $scope.menuMode=true
    $scope.navBarTitle = "Stories"

    
    
    var mediaController = undefined
    
    
    $ionicPopover.fromTemplateUrl('components/mediaControl/mediaControl.html', {
            scope: $scope,
            animation:'in-from-right'
          }).then(function(constructedPopover){
            mediaController = constructedPopover
          });
    $scope.audioButtonClick = function($event){
      mediaController.show($event)
    }
    
    $scope.closePopover = function(){
        mediaController.hide()
    }
    
    //expose this to the popover
    $scope.media = mediaPlayer
}).controller('storiesCtrl', function($scope, $state, server, NgMap){
    
    $scope.mapHandle=8183
    
    $scope.$on( "$ionicView.enter", function() {
        NgMap.getMap($scope.mapHandle).then(function (map) {
            $scope.map = map;
        }, function (error) {
            console.log(error)
        });
    });
    
    
    //display an info window.
    handleStoryClicked = function (story) {
        // make the currently selected place available to the info window
        $scope.clickedStory = story
        $scope.map.showInfoWindow('infoWindow', story.id)
    }
    $scope.markerClicked = function (element, story) {
        handleStoryClicked(story)
    }

    // display the map centered on citadel hill.
    // UX: The map is the first thing people see when opening the app.
    //     What will they want to see? Where they are, or where the stories are?
    $scope.mapInfo = {
        center:"44.6474,-63.5806",
        zoom: 15
    }
    
    //ngModel doesn't work without a dot
    $scope.filter={
        text:''
    }
    
    $scope.stories = []

    //TODO should not run this at app start
    server.getStories(['id','name','location','description','images'])
    .then(function(result){
        $scope.stories = result
    }).catch(function(error){
        console.log(error)
    })
    
    $scope.showStory=function(story){
        if(!$scope.filter.text){
            return true
        }
        return story.name.toLowerCase().indexOf(
            $scope.filter.text.toLowerCase()
        )>=0
    }



}).controller('storyCtrl',function($scope,$stateParams,server, $ionicTabsDelegate, $timeout, $ionicModal, mediaPlayer, $ionicScrollDelegate){

    // UX: The screen is pretty empty when this opens. Could pass the image 
    //     in to display background immediately?
    $scope.story = {
        id:$stateParams.storyID
    }
    $scope.loading=true
    
    server.updateStory(
        $scope.story,['name','description','location','images','audio']              
    )
    .then(function(){
        $timeout(function () {
            $ionicTabsDelegate.$getByHandle('story-tabs-delegate').select(0)
        }, 0);
    }).finally(function(){
        //UX: Go back to previous page, plus an error toast?
        $scope.loading=false
    })
    
    
    //description tab
    $scope.playAudio = function(){
        mediaPlayer.setTrack($scope.story.audio, $scope.story.name)
        mediaPlayer.play()
    }

    //Images tab
    var modal
    $ionicModal.fromTemplateUrl('components/imageView/imageView.html', {
        scope: $scope,
        animation: 'none'
    })
    .then(function(constructedModal) {
        modal = constructedModal;
    });

    openModal = function() {
        modal.show()
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
            modal.hide()
            $scope.imageSrc = undefined
            $ionicScrollDelegate.$getByHandle('zoom-pane').zoomTo(1)
        })
    };
    
    // Map tab
    
    $scope.mapHandle=943571



});
