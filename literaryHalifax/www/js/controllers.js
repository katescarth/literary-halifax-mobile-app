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
        if(menuOpen){
            toggleMenu()
        }
    })
    
    //default state, there's no statechange to
    //the first state. Hacky
    $scope.menuMode=true
    $scope.navBarTitle = "Landmarks"

    
    
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
}).controller('landmarksCtrl', function($scope, $state, server, NgMap){
    
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

    //TODO should not run this at app start
    server.getLandmarks(['id','name','location','description','images'])
    .then(function(result){
        $scope.landmarks = result
    }).catch(function(error){
        console.log(error)
    })
    
    $scope.showLandmark=function(landmark){
        if(!$scope.filter.text){
            return true
        }
        return landmark.name.toLowerCase().indexOf(
            $scope.filter.text.toLowerCase()
        )>=0
    }



}).controller('toursCtrl', function($scope, $state, server){
    
    var location = undefined
    
    
    $scope.$on( "$ionicView.enter", function() {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                function(currentPosition){
                    location={
                        lat: currentPosition.coords.latitude,
                        lng:currentPosition.coords.longitude
                    }
                    console.log(location)
                },function(error){
                    console.log(error)
                })
        } else {
            console.log('no navigator!')
        }
    });
    
    var distanceTo=function(tour){
        if(!(location&&tour.start)){
            console.log('no')
            return -1
        }
        dLat = tour.start.lat-location.lat
        dLng = tour.start.lng-location.lng
        squarekms = Math.pow((dLat*111.1),2) + Math.pow((dLng*79.3),2)
        if(!squarekms){
            console.log(tour.start)
            console.log(location)
        }
        return Math.sqrt(squarekms)
    }
    
    $scope.displayDistance=function(tour){
        dist=distanceTo(tour)
        if(dist>=0){
            return Number(dist).toPrecision(2)
        }
    }
    
    
    //ngModel doesn't work without a dot
    $scope.filter={
        text:''
    }
    
    $scope.tours = []
    
    $scope.go=function(tour){
        $state.go('app.tourView',{tourID:tour.id})
    }

    //TODO should not run this at app start
    server.getTours()
    .then(function(result){
        $scope.tours = result
    }).catch(function(error){
        console.log(error)
    })
    
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
