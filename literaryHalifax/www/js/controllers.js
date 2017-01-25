angular.module('literaryHalifax')

.controller('menuCtrl', function($scope, $ionicHistory, $ionicPopup,
                                 $state, $ionicPlatform, mediaPlayer, $ionicPopover, $interval, leafletData, server, lodash) {
    // items for the side menu
    $scope.menuItems =[
        {
            displayName:'Landmarks',
            onClick:function(){
                $state.go('app.landmarks')
            }
        },
        {
            displayName:'Tours',
            onClick:function(){
                $state.go('app.tours')
            }
        },
        {
            displayName:'Cache Control',
            onClick:function(){
                $state.go('app.cacheControl')
            }
        }
    ]

    $ionicPlatform.ready(function(){
        server.getPages()
            .then(function(pages){
            menuItems = lodash.forEach(pages, function(page){
                $scope.menuItems.push(
                    {
                        displayName:page.title,
                        onClick:function(){
                            $state.go('app.page',{page:page})
                        }
                    }
                )
            })        
        })
    })
    
    //the nav button is either a menu button or a back button
    $scope.navButtonClick=function(){
        if($scope.menuMode){
            toggleMenu()
        }
        else{
            goBack()
        }
    }
    
    var menuWidth = 275
    // tracks whether or not the menu is open
    var menuOpen = false
    // tracks the menu's location. CHANGING THIS VARIABLE DOES NOT
    // MOVE THE MENU
    
    var menuPosition = -menuWidth
    updateMenuPosition = function(newPosition){
        // reposition the menu
        menuPosition=newPosition
        $scope.menuStyle={'left':newPosition+'px'}
                         
        // the shadow appears on the left side of the menu as it slides out
        var shadowLength= 10.0 * newPosition / menuWidth
        $scope.listStyle={'box-shadow':shadowLength+'px 0px 10px #111111'}
    }
    
    // 60 fps
    var frameLength=1000/60.0
    // a full open or close takes 250 seconds
    var maxFrames=(250/frameLength)
    // the interval promise which is currently animating the side menu
    var animationPromise = undefined
    
    //  animate a scroll from the first position to the second
    //  For short distances (like when dragging), this is ineffecient.
    //  Use updateMenuPosition instead
    smoothScroll = function(from,to){
        
        //  only run one animation at once
        if(animationPromise){
            $interval.cancel(animationPromise)
        }
        
        //  number of frames in this animation
        var frameCount=Math.round(maxFrames*Math.abs(from-to)/menuWidth)
        if(!frameCount){
            frameCount=1
        }
        
        //  distance the menu shifts each frame
        var stepSize = (to-from)/frameCount
        var count = 0
        animationPromise=$interval(function(){
            count++
            updateMenuPosition(from+stepSize*count)
        },frameLength,frameCount)
    }
    
    //  convenience funtion. Slide to the given position from the current
    slideTo = function(position){
        smoothScroll(menuPosition, position)
    }
    
    openMenu=function(){
        slideTo(0)
        menuOpen=true
    }
    
    closeMenu=function(){
        slideTo(-menuWidth)
        menuOpen=false
    }
    
    toggleMenu = function(){
        if(menuOpen){
            closeMenu()
        } else {
            openMenu()
        }
    }
    
    // handle a gesture (the user dragging the menu to the left or right)
    
    // the horizontal position where the drag started
    var dragBase = 0.0
    
    // the last known horizontal position of the drag
    var dragPrev = 0.0
    
    // Track how fast the drag is moving and in what direction.
    // See onDrag for the calculation
    var dragVelocity = 0.0
    var decayConstant = 0.5
    $scope.onDragStart = function(event){
        dragBase = menuPosition
    }
    
    $scope.onDrag=function(event){
        newPosition = dragBase+event.gesture.deltaX
        dragVelocity *= decayConstant
        dragVelocity += (newPosition - dragPrev)
        dragPrev = newPosition
        
        if(newPosition<-menuWidth){
            newPosition=-menuWidth
        } else if(newPosition>0){
            newPosition=0
        }
        updateMenuPosition(newPosition)
    }
    
    $scope.onDragEnd = function(event){
        
        var threshold = 4*4
        //if the user swiped quickly, send the menu to the diresction they swiped
        if(dragVelocity*dragVelocity>threshold){
            if(dragVelocity>0){
                openMenu()
            } else {
                closeMenu()
            }
        }
        // if they did not, send the menu to where it was before
        else {
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
        item.onClick()
        if(menuOpen){
            closeMenu()
        }
    }

    //  Handle this ourselves, since we are using a custom back button
    goBack = function(){
        $ionicHistory.goBack()
    }
    

    // check every state change and update navbar accordingly
    $scope.$root.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
        if(toState.title){
            $scope.navBarTitle = toState.title=='Page'?toParams.page.title:toState.title
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

    var BACK_NAV_CODE = 100
    
    // take control of the PHYSICAL back button on android
    // when it tries to navigate back
    // (not when it closes popups, etc.)
    $ionicPlatform.registerBackButtonAction(function(event) {
        
        if(menuOpen){
            closeMenu()
        } else if ($scope.menuMode) {
            $ionicPopup.confirm({
                title: 'Leave app?',
                template: '',
                okType: 'button-balanced'
            }).then(function(shouldLeave) {
                if (shouldLeave) {
                    ionic.Platform.exitApp();
                }
            })
        } else {
            goBack()
        }
    }, BACK_NAV_CODE);
    
    // the panel which controls audio that is being played
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
})
.controller('cacheCtrl', function($scope, server, cacheLayer, $timeout, $q, $ionicPopup){
    $scope.settings={
        cachingEnabled:false,
        showTours:false,
        showLandmarks:false        
    }
    
    $scope.$on('$ionicView.enter',function(){
        $scope.settings.cachingEnabled = cacheLayer.cachingEnabled()
    })
    
    //fires when the toggle is touched.
    $scope.cachingToggled=function(){
        if($scope.settings.cachingEnabled){
            // initialize the cache
            cacheLayer.cacheMetadata()
            .then($scope.refresh)
        }else{
            // delay the update while we show a confirmation popup
            // turning off caching deletes the cache, so we need to make 
            $scope.settings.cachingEnabled = true
            $ionicPopup.confirm({
                title:"Turn caching off?",
                template:"This will delete all of your cached data. You will have to download it again to use it.",
                okType: 'button-balanced'
            }).then(function(shouldDelete) {
                if (shouldDelete) {
                    //caching is being switched off, so collapse the menus
                    $scope.settings.showLandmarks = false
                    $scope.settings.showTours = false
                    $scope.settings.cachingEnabled = false
                    return cacheLayer.destroyCache()
                } else {
                    $scope.settings.cachingEnabled = true
                }
            })
        }
    }
    
    // This is really a misnomer. landmarkIsCached checks if all the files
    // in a landmark are cached
    $scope.landmarkCached = cacheLayer.landmarkIsCached
    
    $scope.tourCached = function(tour){
        // TODO duh
        return true
    }
    
    //cache every file associated with the given landmark
    $scope.cacheLandmark=function(LM){
        // wrap this entire function in a closure so nothing goes wrong if
        // it gets called many times at once
        return (function(landmark){
            var promises = []
            for(var i=0;i<landmark.images.length;i++){
                (function(images){
                    promises.push(cacheLayer.cacheUrl(images.full)
                    .then(function(newUrl){
                        images.full = newUrl
                    }))
                    promises.push(cacheLayer.cacheUrl(images.squareThumb)
                    .then(function(newUrl){
                        images.squareThumb = newUrl
                    }))
                    promises.push(cacheLayer.cacheUrl(images.thumb)
                    .then(function(newUrl){
                        images.thumb = newUrl
                    }))
                })(landmark.images[i])
            }
            promises.push(cacheLayer.cacheUrl(landmark.audio)
                    .then(function(newUrl){
                        landmark.audio = newUrl
                    }))
            return $q.all(promises)
        })(LM)
    }
    
    $scope.clearLandmark = function(LM){
        // wrap this entire function in a closure so nothing goes wrong if
        // it gets called many times at once
        return (function(landmark){
            var promises = []
            for(var i=0;i<landmark.images.length;i++){
                (function(images){
                    promises.push(cacheLayer.clearUrl(images.full)
                    .then(function(newUrl){
                        images.full = newUrl
                    }))
                    promises.push(cacheLayer.clearUrl(images.squareThumb)
                    .then(function(newUrl){
                        images.squareThumb = newUrl
                    }))
                    promises.push(cacheLayer.clearUrl(images.thumb)
                    .then(function(newUrl){
                        images.thumb = newUrl
                    }))
                })(landmark.images[i])
            }
            // TODO audio
            return $q.all(promises)
        })(LM)
    }
    
    $scope.refresh=function(){
        $scope.landmarks = []
        server.getLandmarks()
        .then(function(result){
            $scope.landmarks = result
        })
        
        $scope.tours = []
        server.getTours()
        .then(function(tours){
            $scope.tours=tours
        })
        
    }
    $scope.refresh()
    
    
})
.controller('pageCtrl', function($scope, $stateParams){
    $scope.page = $stateParams.page
})

.controller('landmarksCtrl', function($scope, $state, server, $q, utils, lodash,leafletData){
    
    
    // number of items to show in the list. Increased as user scrolls down
    $scope.numListItems = 5
    
    // the map. Needed this so we can invalidate its size if it gets in a bad state.
    var map = undefined
    
    leafletData.getMap()
        .then(
            function(result){
                map=result
            },function(error){
                console.log(error)
            }
        )
    
    var inval = function(){
        if(map){
            map.invalidateSize()
        }
    }
    
    //  When navigating back to a map, the tiles will sometimes
    //  only render in the top left corner. Making the map resize
    //  inself fixes the issue
    $scope.$on('$ionicView.afterEnter',function(){
        inval()
    })
    
    $scope.displayMore = function(){
        $scope.numListItems+=5
        $scope.$broadcast('scroll.infiniteScrollComplete');
    }
    
    // the user's location
    var location = undefined
    
    // Number of kilometers to display, rounded to two Significant figures.
    // If this cannot be calculated (e.g. one of the locations is missing),
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
        
        
    
    $scope.refresh=function(){
        
        $scope.landmarks = []
        $scope.markers = []
        $scope.errorMessage = ''
        $scope.loadingMsg = 'Getting your location...'
        //try to get the user's position
        utils.getPosition({
                    //we can accept an old result - stalling here shoud be avoided
                    maximumAge: 60000, 
                    timeout: 5000, 
                    enableHighAccuracy: true 
                })
        .then(
            function(result){
                $scope.loadingMsg = 'Getting Landmarks...'
                location = result
                return server.getLandmarks(location)
            },
            function(error){
                //if we can't get the position, just carry on without it.
                $scope.loadingMsg = 'Getting Landmarks...'
                return server.getLandmarks()
            }
        )
        .then(function(result){
            $scope.landmarks = result
            $scope.loadingMsg=''

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
            $scope.loadingMsg=''
            $scope.errorMessage = error
        })
        
    }
    
    $scope.refresh()
    
    
    

    // display the map centered on citadel hill.
    // UX: The map is the first thing people see when opening the app.
    //     What will they want to see? Where they are, or where the landmarks are?
    $scope.mapInfo = {
        lat:44.6474,
        lng:-63.5806,
        zoom: 15
    }
    
    //ngModel doesn't work without a dot. Represents the text entered into the filter bar
    $scope.filter={
        text:''
    }
    
    //false if a landmark is being filtered out, otherwise true
    $scope.showLandmark=function(landmark){
        if(!$scope.filter.text){
            return true
        }
        return landmark.name.toLowerCase().indexOf(
            $scope.filter.text.toLowerCase()
        )>=0
    }
    // show or hide markers according to whether or not their corresponding
    // landmarks should be filtered out
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
    
    //  Go to landmark view for the given landmark
    $scope.go=function(landmark){
        $state.go('app.landmarkView',{landmarkID:landmark.id})
    }



}).controller('toursCtrl', function($scope, $state, $q, server, utils, lodash){
    
    
    var location = undefined
    
    $scope.loadingMsg = ''
    
    // When the view is entered, try to get the user's location.
    // If successful, use it to get the tours from the server
    // in order of nearness. Otherwise, get the tours in arbitrary order
        
    
    $scope.loadResults=function(){
        location = undefined
        $scope.tours = []
        $scope.loadingMsg='getting your location...'
        $scope.errorMsg=''
        utils.getPosition({
                //we can accept an old result - stalling here shoud be avoided
                maximumAge: 60000, 
                timeout: 5000, 
                enableHighAccuracy: true 
            })
        .then(
            function(result){

                location=result
                $scope.loadingMsg='getting tours...'
                return server.getTours(location)

            },
            function(error){
                console.log(error)
                $scope.loadingMsg='getting tours...'
                return server.getTours()
            })
        .then(
            function(result){
                $scope.loadingMsg=''
                $scope.tours = result
            },
            function(error){
                $scope.loadingMsg=''
                $scope.errorMsg=error
            }
        )
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
    
    
    $scope.refresh = function(){
        $scope.loadingMsg='Getting landmark info...'
        $scope.errorMsg = ''
        server.landmarkInfo($stateParams.landmarkID)
        .then(function(landmark){
            $scope.landmark=landmark
        })
        .catch(function(error){
            $scope.errorMsg = error
        })
        .finally(function(){
            updateMarker()
            //UX: On failure go back to previous page, plus an error toast?
            $scope.loadingMsg=''
        })
    }
    
    $scope.refresh()
    
    
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
    
    // display an image in the image modal
    $scope.display = function(url){
        $scope.imageSrc = url
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
    
    
    // If a landmark is the current landmark, green. If it's a previous one, grey. If it's ahead, blue
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

    //  show an info window for a landmark (specified by index)
    //  and make sure that no other windows are displayed.
    //  Also center the map on the marker
    $scope.focus=function(event, landmarkIndex){
        event.stopPropagation()
        for(i=0;i<$scope.markers.length;i++){
            // unfocus all the other ones
            $scope.markers[i].focus=(i==landmarkIndex)
        }
        $scope.mapInfo.lat=$scope.markers[landmarkIndex].lat
        $scope.mapInfo.lng=$scope.markers[landmarkIndex].lng
    }

    // utility method for going to a landmark and moving the position in 
    // the tour appropriately
    $scope.goTo=function(destIndex){

        $scope.currentLandmark = destIndex
        for(i=0;i<$scope.markers.length;i++){
            updateIcon(i)
        }
        $scope.upNextClicked()        
    }
    
    // advancing the current landmark (but not navigating to it)
    $scope.toNext = function(){
        if($scope.currentLandmark < $scope.tour.landmarks.length - 1){
            $scope.currentLandmark+=1
            updateIcon($scope.currentLandmark)
            updateIcon($scope.currentLandmark-1)
        }
    }
    
    // retracting the current landmark (but not navigating to it)
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
    
    $scope.refresh = function(){
        server.tourInfo(
            $stateParams.tourID            
        ).then(function(tour){
            //TODO pan to the start of the tour

            $scope.tour=tour
            $scope.loadingMsg='Getting landmarks'
            $scope.errorMsg=''
            var promises = []
            for(i=0;i<$scope.tour.landmarks.length;i++){
                // Use a closure to give the promises access to index
                (function(index){
                    promises.push(
                        server.landmarkInfo($scope.tour.landmarks[index].id)
                        .then(function(landmark){
                            angular.extend($scope.tour.landmarks[index], landmark)
                        })
                    )
                })(i)
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
        .catch(function(error){
            //UX: back to previous page, plus an error toast?
            $scope.errorMsg = error
        })
        .finally(function(){
            $scope.loadingMsg=''
        })
    }
    
    // TODO should be in an onEnter callback
    $scope.refresh()
    
});
