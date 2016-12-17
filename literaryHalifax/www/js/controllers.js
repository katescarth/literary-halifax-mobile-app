angular.module('literaryHalifax')

.controller('menuCtrl', function($scope, $ionicHistory, $ionicPopup,
                                 $state, $ionicPlatform, mediaPlayer, $ionicPopover, $interval, leafletData) {
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

    //the nav button is either a menu button or a back button
    $scope.navButtonClick=function(){
        if($scope.menuMode){
            toggleMenu()
        }
        else{
            goBack()
        }
    }
    
    // track whether or not the menu is open
    var menuOpen = false
    // track the menu's location. CHANGING THIS VARIABLE DOES NOTHING
    var menuPosition = -275
    updateMenuPosition = function(newPosition){
        menuPosition=newPosition
        
        var shadowLength= newPosition/27.5
        
        $scope.menuStyle={'left':newPosition+'px'}
                         
        $scope.listStyle={'box-shadow':shadowLength+'px 0px 10px #111111'}
    }
    
    var frameLength=1000/60.0
    var maxSteps=(250/frameLength)
    var animationPromise = undefined
    smoothScroll = function(from,to){
        if(animationPromise){
            $interval.cancel(animationPromise)
        }
        var stepCount=Math.round(maxSteps*Math.abs(from-to)/275)
        if(!stepCount){
            stepCount=1
        }
        var stepSize = (to-from)/stepCount
        var count = 0
        animationPromise=$interval(function(){
            count++
            updateMenuPosition(from+stepSize*count)
        },frameLength,stepCount)
    }
    
    slideTo = function(position){
        smoothScroll(menuPosition, position)
    }
    
    openMenu=function(){
        slideTo(0)
        menuOpen=true
    }
    
    closeMenu=function(){
        slideTo(-275)
        menuOpen=false
    }
    
    toggleMenu = function(){
        if(menuOpen){
            closeMenu()
        } else {
            openMenu()
        }
    }
    
    
    var dragBase =0.0
    var dragPrev =0.0
    var dragVelocity =0.0
    
    // at smaller values, more recent movements matter more.
    var decayConstant = 0.8
    $scope.onDragStart = function(event){
        dragBase = menuPosition
    }
    
    $scope.onDrag=function(event){
        newPosition = dragBase+event.gesture.deltaX
        dragVelocity *= decayConstant
        dragVelocity += (newPosition - dragPrev)
        dragPrev = newPosition
        
        if(newPosition<-275){
            newPosition=-275
        } else if(newPosition>0){
            newPosition=0
        }
        updateMenuPosition(newPosition)
    }
    
    $scope.onDragEnd = function(event){
        
        var threshold = 4*4
        
        if(dragVelocity*dragVelocity>threshold){
            if(dragVelocity>0){
                openMenu()
            } else {
                closeMenu()
            }
        } else {
            if(menuOpen){
                openMenu()
            } else {
                closeMenu()
            }
        }
        
        dragBase =0.0
        dragPrev =0.0
        dragVelocity =0.0
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

    // take control of back button when it tries to navigate back
    // (not when it closes popups, etc.)
    $ionicPlatform.registerBackButtonAction(function(event) {
        
        if(menuOpen){
            closeMenu()
        } else if ($scope.menuMode) {
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
}).controller('landmarksCtrl', function($scope, $state, server, $q, utils, lodash,leafletData){
    
    $scope.numListItems = 5
    
    var map
    
    leafletData.getMap()
        .then(
            function(result){
                map=result
            },function(error){
                console.log(error)
            }
        )
    
    inval = function(){
        if(map){
            map.invalidateSize()
        }
    }
    
    $scope.$on('$ionicView.afterEnter',function(){
        inval()
    })
    
    $scope.displayMore = function(){
        $scope.numListItems+=5
        $scope.$broadcast('scroll.infiniteScrollComplete');
    }
    
    var location = undefined
    
    // Number of kilometers to display, rounded to two decimal points.
    // If this cannot be calculated (e.g. one of the locations is missing)
    // return undefined
    $scope.displayDistance=function(landmark){
        if(location && landmark && landmark.location){
            dist=utils.distance(location,landmark.location)
            if(dist>=0){
                return Number(dist).toPrecision(2)
            }
        }
        return undefined
    }
        
        
    $scope.loadingMsg = ''
    var attrs = ['id','name','location','description','images']
    var fetchLandmarks=$q.defer()
    if(navigator.geolocation){
        $scope.loadingMsg = 'Getting your location...'
        navigator.geolocation.getCurrentPosition(
            function(currentPosition){
                $scope.loadingMsg = 'Getting landmarks...'
                location ={
                    lat: currentPosition.coords.latitude,
                    lng:currentPosition.coords.longitude
                }
                fetchLandmarks.resolve(
                    server.getLandmarks(location)
                )
            },
            function(error){
                console.log(error)
                $scope.loadingMsg = 'Getting landmarks...'
                fetchLandmarks.resolve(server.getLandmarks())
            },
            {
                //we can accept an old result - stalling here shoud be avoided
                maximumAge: 60000, 
                timeout: 5000, 
                enableHighAccuracy: true 
            }
        )
    } else {
        $scope.loadingMsg = 'Getting landmarks...'
        fetchLandmarks.resolve(server.getLandmarks())
    }

    fetchLandmarks.promise.then(function(result){
        $scope.loadingMsg = ''
        $scope.landmarks = result
        
        $scope.markers = lodash.times(result.length, function(index){
            
            var landmark=result[index]
            return {
                lat: landmark.location.lat,
                lng: landmark.location.lng,
                message:
                    "<div class='info-window' dotdotdot ng-click='go(landmarks["+index+"])'>" +
                        "<h6>"+landmark.name+"</h6>" +
                        "<p>"+landmark.description+"</p>"+
                     "</div>",
                getMessageScope: function(){return $scope},
                focus: false,
                icon: {
                    iconUrl: "img/green-pin.png",
                    iconSize:     [21, 30], // size of the icon
                    iconAnchor:   [10.5, 30], // point of the icon which will correspond to marker's location
                    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
                }
            }
        })
    }).catch(function(error){
        console.log(error)
    })

    // display the map centered on citadel hill.
    // UX: The map is the first thing people see when opening the app.
    //     What will they want to see? Where they are, or where the landmarks are?
    $scope.mapInfo = {
        lat:44.6474,
        lng:-63.5806,
        zoom: 15
    }
    
    //ngModel doesn't work without a dot
    $scope.filter={
        text:''
    }
    
    $scope.landmarks = []
    
    //false if a landmark is being filtered out, otherwise true
    $scope.showLandmark=function(landmark){
        if(!$scope.filter.text){
            return true
        }
        return landmark.name.toLowerCase().indexOf(
            $scope.filter.text.toLowerCase()
        )>=0
    }
    
    $scope.applyFilter = function(){
        lodash.times($scope.markers.length,function(index){
            var marker = $scope.markers[index]
            var landmark = $scope.landmarks[index]
            if($scope.showLandmark(landmark)){
                marker.opacity=1
            } else {
                marker.opacity=0
                marker.focus=false
            }
            
        })
    }
    
$scope.clearFilter = function(){
    $scope.filter.text=''
    $scope.applyFilter()
}
    
    $scope.go=function(landmark){
        $state.go('app.landmarkView',{landmarkID:landmark.id})
    }



}).controller('toursCtrl', function($scope, $state, $q, server, utils, lodash){
    
    var location = undefined
    
    $scope.loadingMsg = ''
    
    $scope.markers =[]
    
    // When the view is entered, try to get the user's location.
    // If successful, use it to get the tours from the server
    // in order of nearness. Otherwise, get the tours in arbitrary order
        
    
    $scope.loadResults=function(){
        var deferred=$q.defer()
        if(navigator.geolocation){
            $scope.loadingMsg='getting your location...'
            $scope.errorMsg=''
            navigator.geolocation.getCurrentPosition(
                function(currentPosition){
                    location={
                        lat: currentPosition.coords.latitude,
                        lng:currentPosition.coords.longitude
                    }
                    $scope.loadingMsg='getting tours...'
                    deferred.resolve(server.getTours(location))
                },
                function(error){
                    $scope.loadingMsg='getting tours...'
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
            $scope.loadingMsg='getting tours...'
            deferred.resolve(server.getTours())
        }

        deferred.promise.then(function(result){
            $scope.loadingMsg=''
            $scope.tours = result        
        }).catch(function(error){
            $scope.loadingMsg=''
            $scope.errorMsg=error
        })
    }
    
    $scope.loadResults()
    
    // Number of kilometers to display, rounded to two decimal points.
    // If this cannot be calculated (e.g. one of the locations is missing)
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
    
    // expose the track name to the view
    $scope.media = mediaPlayer
    
    $scope.loadingMsg='Getting landmark info...'
    
    server.landmarkInfo($stateParams.landmarkID)
    .then(function(landmark){
        $scope.landmark=landmark
    })              
    .finally(function(){
        updateMarker()
        //UX: On failure go back to previous page, plus an error toast?
        $scope.loadingMsg=''
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
    
    $scope.doubleTap = function(event){
        delegate = $ionicScrollDelegate.$getByHandle('zoom-pane')
        if(delegate){
            if(delegate.getScrollPosition().zoom==1){
                delegate.zoomBy(2,true)
            } else {
                delegate.zoomTo(1,true)
            }
        }
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
    var marker = {}
    $scope.markers = [marker]
    
    $scope.mapInfo = {
        lat:0,
        lng:0,
        zoom:13
    }
    updateMarker=function(){
        if(!marker.lat){
            angular.extend(marker, 
                {
                    lat: $scope.landmark.location.lat,
                    lng: $scope.landmark.location.lng,
                    focus: false,
                    clickable:false,
                    icon: {
                        iconUrl: "img/green-pin.png",
                        iconSize:     [21, 30], // size of the icon
                        iconAnchor:   [10.5, 30], // point of the icon which will correspond to marker's location
                        popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
                    }
                }
            )
        } else {
            marker.lat= $scope.landmark.location.lat
            marker.lng= $scope.landmark.location.lng
        }
        $scope.mapInfo.lat=marker.lat
        $scope.mapInfo.lng=marker.lng
    }


}).controller('tourCtrl',function($scope,$stateParams, server, $state, $q,$timeout){
    
    iconFor = function(index){
        var url
        if (index<$scope.currentLandmark) {
            url = "img/grey-pin.png"
        } else if (index==$scope.currentLandmark) {
            url = "img/green-pin.png"
        } else {
            url = "img/blue-pin.png"
        }
        
        return url
    }
    
    updateIcon = function(index){
        $scope.markers[index].icon.iconUrl = iconFor(index)
    }
    
    $scope.markers =[]
    
    $scope.mapInfo = {
            lat:44.6474,
            lng:-63.5806,
            zoom: 15
        }
    // index of the current landmark (the one user will visit next)
    $scope.currentLandmark=0
    
    $scope.upNextClicked = function(){
        $scope.go($scope.tour.landmarks[$scope.currentLandmark])
        // When the user returns, they will automatically be advanced
        // Whether this is correct or not is a UX question
        $scope.toNext()
    }

    $scope.focus=function(event, landmarkIndex){
        event.stopPropagation()
        for(i=0;i<$scope.markers.length;i++){
            $scope.markers[i].focus=(i==landmarkIndex)
        }
        $scope.mapInfo.lat=$scope.markers[landmarkIndex].lat
        $scope.mapInfo.lng=$scope.markers[landmarkIndex].lng
    }

    $scope.goTo=function(destIndex){

        $scope.currentLandmark = destIndex
        for(i=0;i<$scope.markers.length;i++){
            updateIcon(i)
        }
        $scope.upNextClicked()        
    }
    
    
    $scope.toNext = function(){
        if($scope.currentLandmark < $scope.tour.landmarks.length - 1){
            $scope.currentLandmark+=1
            updateIcon($scope.currentLandmark)
            updateIcon($scope.currentLandmark-1)
        }
    }
    
    $scope.toPrev = function(){
        if($scope.currentLandmark > 0){
            $scope.currentLandmark-=1
            updateIcon($scope.currentLandmark+1)
            updateIcon($scope.currentLandmark)
        }
    }
    
    $scope.go=function(landmark){
        $state.go('app.landmarkView',{landmarkID:landmark.id})
    }
    
    server.tourInfo(
        $stateParams.tourID,['name','landmarks','description','start']              
    ).then(function(tour){
        //TODO pan to the start of the tour
        
        $scope.tour=tour
        $scope.loadingMsg='Getting landmarks'
        var promises = []
        for(i=0;i<$scope.tour.landmarks.length;i++){
            promises.push(server.updateLandmark($scope.tour.landmarks[i],['name','description','location']))
        }
        
        return $q.all(promises).then(function(){
            for(i=0;i<$scope.tour.landmarks.length;i++){
                $scope.markers[i] =
                    {
                        lat: $scope.tour.landmarks[i].location.lat,
                        lng: $scope.tour.landmarks[i].location.lng,
                        message:
                                "<span ng-click='goTo("+i+")'>" +
                                 $scope.tour.landmarks[i].name+
                                 "</span>",
                        getMessageScope: function(){return $scope},
                        focus: false,
                        icon: {
                            iconUrl: iconFor(i),
                            iconSize:     [21, 30], // size of the icon
                            iconAnchor:   [10.5, 30], // point of the icon which will correspond to marker's location
                            popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
                        },
                    }
            }
        })
    })
    .finally(function(){
        //UX: Go back to previous page, plus an error toast?
        $scope.loadingMsg=''
    })
    
});
