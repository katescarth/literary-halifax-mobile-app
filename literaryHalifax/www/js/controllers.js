angular.module('literaryHalifax')

.controller('menuCtrl', function($scope, $ionicSideMenuDelegate, $ionicHistory, $ionicPopup,
                                 $state, $ionicPlatform, mediaPlayer, $ionicPopover) {
    // items for the side menu
    $scope.menuItems =[
        {
            displayName:'Landmarks',
            state:'app.landmarks'
        },
        {
            displayName:'Tours',
            state:'app.tours'
        },
        {
            displayName:'Cache Control',
            state:'app.cacheControl'
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
                template: '',
                okType: 'button-balanced'
            }).then(function(res) {
                if (res) {
                    ionic.Platform.exitApp();
                }
            })
        } else {
            goBack()
        }
    }, 100);

    //the nav button is either a menu button or a back button
    $scope.navButtonClick=function(){
        if($scope.menuMode){
            toggleMenu()
        }
        else{
            goBack()
        }
    }
    
    //track whether or not the menu is open
    menuOpen=false
    toggleMenu = function(){
        menuOpen=!menuOpen
        if(menuOpen){
            $scope.menuClass = 'slideRight'
        } else {
            $scope.menuClass = 'slideLeft'
        }
    }
    
    //navigate to the selected destination, and close the menu
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
        if(menuOpen){
            toggleMenu()
        }
    })
    
    //default state, there's no statechange to
    //the first state. Hacky
    $scope.menuMode=true
    $scope.navBarTitle = "Landmarks"

    
    // the popover which controls audio that is being played
    var mediaController = undefined
    
    
    $ionicPopover.fromTemplateUrl('components/mediaControl/mediaControl.html', {
            scope: $scope,
            animation:'in-from-right'
          }).then(function(constructedPopover){
            mediaController = constructedPopover
          });
    
    //display the popover. $event tells the popover where to appear
    $scope.audioButtonClick = function($event){
      mediaController.show($event)
    }
    
    $scope.closePopover = function(){
        mediaController.hide()
    }
    
    //expose this to the popover
    $scope.media = mediaPlayer
}).controller('landmarksCtrl', function($scope, $state, server, NgMap){
    
    //random number
    $scope.mapHandle=8183
    
    $scope.$on( "$ionicView.enter", function() {
        NgMap.getMap($scope.mapHandle).then(function (map) {
            $scope.map = map;
        }, function (error) {
            console.log(error)
        });
    });
    
    
    //display an info window.
    handleLandmarkClicked = function (landmark) {
        // make the currently selected place available to the info window
        $scope.clickedLandmark = landmark
        $scope.map.showInfoWindow('infoWindow', landmark.id)
    }
    $scope.markerClicked = function (element, landmark) {
        handleLandmarkClicked(landmark)
    }

    // display the map centered on citadel hill.
    // UX: The map is the first thing people see when opening the app.
    //     What will they want to see? Where they are, or where the landmarks are?
    $scope.mapInfo = {
        center:"44.6474,-63.5806",
        zoom: 15
    }
    
    //ngModel doesn't work without a dot
    $scope.filter={
        text:''
    }
    
    $scope.landmarks = []

    server.getLandmarks(['id','name','location','description','images'])
    .then(function(result){
        $scope.landmarks = result
    }).catch(function(error){
        console.log(error)
    })
    
    //false if a landmark is being filtered out, otherwise true
    $scope.showLandmark=function(landmark){
        if(!$scope.filter.text){
            return true
        }
        return landmark.name.toLowerCase().indexOf(
            $scope.filter.text.toLowerCase()
        )>=0
    }



}).controller('toursCtrl', function($scope, $state, $q, server, utils){
    
    var location = undefined
    
    // When the view is entered, try to get the user's location.
    // If successful, use it to get the tours from the server
    // in order of nearness. Otherwise, get the tours in arbitrary order
    $scope.$on( "$ionicView.enter", function() {
        var deferred=$q.defer()
        
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                function(currentPosition){
                    location={
                        lat: currentPosition.coords.latitude,
                        lng:currentPosition.coords.longitude
                    }

                    deferred.resolve(server.getTours(location))
                },
                function(error){
                    console.log(error)
                    deferred.resolve(server.getTours())
                },
                {
                    //we can accept an old result - stalling here shoud be avoided
                    maximumAge: 60000, 
                    timeout: 5000, 
                    enableHighAccuracy: true 
                }
            )
        } else {
            deferred.resolve(server.getTours())
        }
        
        deferred.promise.then(function(result){
            $scope.tours = result
        }).catch(function(error){
            console.log(error)
        })
    });
    
    // Number of kilometers to display, rounded to two decimal points.
    // If this cannot be calculated ()e.g. one of the locations is missing)
    // return undefined
    $scope.displayDistance=function(tour){
        if(location && tour && tour.start){
            dist=utils.distance(location,tour.start)
            if(dist>=0){
                return Number(dist).toPrecision(2)
            }
        }
        return undefined
    }
    
    
    //ngModel doesn't work without a dot
    $scope.filter={
        text:''
    }
    
    $scope.tours = []
    
    $scope.go=function(tour){
        $state.go('app.tourView',{tourID:tour.id})
    }
    
    // false if a tour is filtered out, otherwise true
    $scope.showTour=function(tour){
        if(!$scope.filter.text){
            return true
        }
        return tour.name.toLowerCase().indexOf(
            $scope.filter.text.toLowerCase()
        )>=0
    }



}).controller('landmarkCtrl',function($scope,$stateParams,server, $ionicTabsDelegate, $timeout, $ionicModal, mediaPlayer, $ionicScrollDelegate){

    // UX: The screen is pretty empty when this opens. Could pass the image 
    //     in to display background immediately?
    $scope.landmark = {
        id:$stateParams.landmarkID
    }
    $scope.loading=true
    
    server.updateLandmark(
        $scope.landmark,['name','description','location','images','audio']              
    )
    .then(function(){
        $timeout(function () {
            $ionicTabsDelegate.$getByHandle('landmark-tabs-delegate').select(0)
        }, 0);
    }).finally(function(){
        //UX: Go back to previous page, plus an error toast?
        $scope.loading=false
    })
    
    
    //description tab
    $scope.playAudio = function(){
        mediaPlayer.setTrack($scope.landmark.audio, $scope.landmark.name)
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



}).controller('tourCtrl',function($scope,$stateParams, server, $state){

    $scope.tour = {
        id:$stateParams.tourID
    }
    $scope.loading=true
    
    $scope.go=function(landmark){
        $state.go('app.landmarkView',{landmarkID:landmark.id})
    }
    
    server.updateTour(
        $scope.tour,['name','landmarks','description']              
    ).then(function(){
        for(i=0;i<$scope.tour.landmarks.length;i++){
            server.updateLandmark($scope.tour.landmarks[i],['name','description'])
        }
    })
    .finally(function(){
        //UX: Go back to previous page, plus an error toast?
        $scope.loading=false
    })
    
});
