/*global angular */
/*global ionic */
angular.module('literaryHalifax').controller('menuCtrl', function ($scope, $ionicHistory, $ionicPopup, $state, $ionicPlatform, mediaPlayer, $ionicPopover, $interval, $log, leafletData, server, lodash) {
    // items for the side menu
    "use strict";
    var menuWidth = 275,
        // tracks whether or not the menu is open
        menuOpen = false,
        // tracks the menu's location. CHANGING THIS VARIABLE DOES NOT
        // MOVE THE MENU
        menuPosition = -menuWidth,
        // 60 fps
        frameLength = 1000 / 60.0,
        // a full open or close takes 250 seconds
        maxFrames = (250 / frameLength),
        // the interval promise which is currently animating the side menu
        animationPromise,
    
        // the horizontal position where the drag started
        dragBase = 0.0,
        // the last known horizontal position of the drag
        dragPrev = 0.0,
        // Track how fast the drag is moving and in what direction.
        // See onDrag for the calculation
        dragVelocity = 0.0,
        decayConstant = 0.5,
        BACK_NAV_CODE = 100,
        // the panel which controls audio that is being played
        mediaController,
        staticItems = [
            {
                displayName: 'Landmarks',
                onClick: function () {
                    $state.go('app.landmarks');
                }
            }, {
                displayName: 'Tours',
                onClick: function () {
                    $state.go('app.tours');
                }
            }, {
                displayName: 'Offline Options',
                onClick: function () {
                    $state.go('app.cacheControl');
                }
            }
        ];
    $scope.menuItems = staticItems;
    
    function updateMenuPosition(newPosition) {
        // reposition the menu
        menuPosition = newPosition;
        $scope.menuStyle = {
            'left': newPosition + 'px'
        };
        // the shadow appears on the left side of the menu as it slides out
        var shadowLength = 10.0 * newPosition / menuWidth;
        $scope.listStyle = {
            'box-shadow': shadowLength + 'px 0px 10px #111111'
        };
    }
    //  animate a scroll from the first position to the second
    //  For short distances (like when dragging), this is ineffecient.
    //  Use updateMenuPosition instead
    function smoothScroll(from, to) {
        //  only run one animation at once
        if (animationPromise) {
            $interval.cancel(animationPromise);
        }
        //  number of frames in this animation. Must be at least 1
        var frameCount = Math.max(1, Math.round(maxFrames * Math.abs(from - to) / menuWidth)),
            stepSize = (to - from) / frameCount,
            count = 0;
        //  distance the menu shifts each frame
        animationPromise = $interval(function () {
            count += 1;
            updateMenuPosition(from + stepSize * count);
        }, frameLength, frameCount);
    }
    //  convenience funtion. Slide to the given position from the current
    function slideTo(position) {
        smoothScroll(menuPosition, position);
    }
    function openMenu() {
        slideTo(0);
        menuOpen = true;
    }
    function closeMenu() {
        slideTo(-menuWidth);
        menuOpen = false;
    }
    function toggleMenu() {
        if (menuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    function goBack() {
        $ionicHistory.goBack();
    }
    //the nav button is either a menu button or a back button
    $scope.navButtonClick = function () {
        if ($scope.menuMode) {
            toggleMenu();
        } else {
            goBack();
        }
    };
    
    $scope.facebook = function () {
        window.open("https://www.facebook.com/halifaxliterarylandmarks");
    };
    
    $scope.twitter = function () {
        window.open("https://twitter.com/halifaxliterary");
    };
    
    $scope.instagram = function () {
        window.open("https://www.instagram.com/halifaxliterarylandmarks/");
    };
    
    $scope.mail = function () {
        window.open("mailto:halifaxliterarylandmarks@gmail.com");
    };
    
    // handle a gesture (the user dragging the menu to the left or right)
    $scope.onDragStart = function (event) {
        dragBase = menuPosition;
    };
    $scope.onDrag = function (event) {
        var newPosition = dragBase + event.gesture.deltaX;
        dragVelocity *= decayConstant;
        dragVelocity += (newPosition - dragPrev);
        dragPrev = newPosition;
        if (newPosition < -menuWidth) {
            newPosition = -menuWidth;
        } else if (newPosition > 0) {
            newPosition = 0;
        }
        updateMenuPosition(newPosition);
    };
    $scope.onDragEnd = function (event) {
        var threshold = 4 * 4;
            //if the user swiped quickly, send the menu to the diresction they swiped
        if (dragVelocity * dragVelocity > threshold) {
            if (dragVelocity > 0) {
                openMenu();
            } else {
                closeMenu();
            }
        // if they did not, send the menu to where it was before
        } else {
            if (menuOpen) {
                openMenu();
            } else {
                closeMenu();
            }
        }
        dragBase = 0.0;
        dragPrev = 0.0;
        dragVelocity = 0.0;
    };
    //navigate to the selected destination, and close the menu
    $scope.menuItemClick = function (item) {
        $ionicHistory.nextViewOptions({
            disableAnimate: true
        });
        item.onClick();
        if (menuOpen) {
            closeMenu();
        }
    };
    //  Handle this ourselves, since we are using a custom back button
    // check every state change and update navbar accordingly
    $scope.$root.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (toState.title) {
            $scope.navBarTitle = toState.title === 'Page' ? toParams.page.title : toState.title;
            $scope.menuMode = true;
        } else {
            $scope.menuMode = false;
        }
        if (menuOpen) {
            toggleMenu();
        }
    });
    //default state, there's no statechange to
    //the first state. Hacky
    $scope.menuMode = true;
    $scope.navBarTitle = "Landmarks";
        // take control of the PHYSICAL back button on android
        // when it tries to navigate back
        // (not when it closes popups, etc.)
    $ionicPlatform.registerBackButtonAction(function (event) {
        if (menuOpen) {
            closeMenu();
        } else if ($scope.menuMode) {
            $ionicPopup.confirm({
                title: 'Leave app?',
                template: '',
                okType: 'button-balanced'
            }).then(function (shouldLeave) {
                if (shouldLeave) {
                    ionic.Platform.exitApp();
                }
            });
        } else {
            goBack();
        }
    }, BACK_NAV_CODE);
    $ionicPopover.fromTemplateUrl('components/mediaControl/mediaControl.html', {
        scope: $scope,
        animation: 'in-from-right'
    }).then(function (constructedPopover) {
        mediaController = constructedPopover;
    });
    //display the popover. $event tells the popover where to appear
    $scope.audioButtonClick = function ($event) {
        mediaController.show($event);
    };
    $scope.$watch('media.isPlaying', function (newVal, oldVal) {
        if (newVal && !oldVal && !mediaController.isShown()) {
            mediaController.show('.media-display-target');
        }
    });
    $scope.closePopover = function () {
        mediaController.hide();
    };
    //expose this to the popover
    $scope.media = mediaPlayer;
    
    $scope.refresh = function () {
        server.getAll("simple_pages").then(function (pages) {
            $scope.menuItems = lodash.unionBy(
                staticItems,
                lodash.map(pages, function (page) {
                    return {
                        displayName: page.title,
                        onClick: function () {
                            $state.go('app.page', {
                                page: page
                            });
                        }
                    };
                }),
                'displayName'
            );
        }, function (error) {
            $log.error('error getting pages: ' + angular.toJson(error));
        });
    };
    $scope.$root.$on('$cordovaNetwork:online', $scope.refresh);
    $ionicPlatform.ready(function () {
        $scope.refresh();
    });
}).controller('cacheCtrl', function ($scope, server, cacheLayer, $timeout, $q, $ionicPopup, lodash, $log) {
    "use strict";
    $scope.settings = {
        cachingEnabled: false,
        showTours: false,
        showLandmarks: false
    };
    $scope.expandedTours = [];
    $scope.$on('$ionicView.enter', function () {
        $scope.settings.cachingEnabled = cacheLayer.cachingEnabled();
        $scope.expandedTours = [];
        if ($scope.settings.cachingEnabled) {
            $scope.refresh();
        }
    });
    //fires when the toggle is touched.
    $scope.cachingToggled = function () {
        if ($scope.settings.cachingEnabled) {
            // initialize the cache
            cacheLayer.cacheMetadata().then($scope.refresh, function (error) {
                $log.error('error turning on caching: ' + angular.toJson(error));
                // TODO toast
                $scope.settings.showLandmarks = false;
                $scope.settings.showTours = false;
                $scope.settings.cachingEnabled = false;
            }).finally(function () {
                $scope.expandedTours = [];
            });
        } else {
            // delay the update while we show a confirmation popup
            // turning off caching deletes the cache, so we need to make 
            $scope.settings.cachingEnabled = true;
            $ionicPopup.confirm({
                title: "Turn caching off?",
                template: "This will delete all of your cached data. You will have to download it again to use it.",
                okType: 'button-balanced'
            }).then(function (shouldDelete) {
                if (shouldDelete) {
                    //caching is being switched off, so collapse the menus
                    $scope.settings.showLandmarks = false;
                    $scope.settings.showTours = false;
                    $scope.settings.cachingEnabled = false;
                    return cacheLayer.destroyCache().then(function () {
                        $scope.landmarks = [];
                        $scope.tours = [];
                        $scope.expandedTours = [];
                    });
                } else {
                    $scope.settings.cachingEnabled = true;
                }
            });
        }
    };
    // This is really a misnomer. landmarkIsCached checks if all the files
    // in a landmark are cached
    $scope.landmarkCached = cacheLayer.landmarkIsCached;
    $scope.tourCached = function (tour) {
        return lodash.every(tour.landmarks, cacheLayer.landmarkIsCached);
    };
    $scope.cachedLandmarkCount = function (tour) {
        return lodash.filter(tour.landmarks, $scope.landmarkCached).length;
    };
    //cache every file associated with the given landmark
    $scope.cacheLandmark = function (landmark) {
        var promises = [
            cacheLayer.cacheUrl(landmark.audio).then(function (newUrl) {
                landmark.audio = newUrl;
            })
        ];
        lodash.forEach(landmark.images, function (images) {
            promises.push(cacheLayer.cacheUrl(images.full).then(function (newUrl) {
                images.full = newUrl;
            }));
            promises.push(cacheLayer.cacheUrl(images.squareThumb).then(function (newUrl) {
                images.squareThumb = newUrl;
            }));
            promises.push(cacheLayer.cacheUrl(images.thumb).then(function (newUrl) {
                images.thumb = newUrl;
            }));
        });
        return $q.all(promises);
    };
    //cache every landmark in the given tour
    $scope.cacheTour = function (tour) {
        return lodash.forEach(tour.landmarks, $scope.cacheLandmark);
    };
    $scope.clearLandmark = function (landmark) {
        var promises = [cacheLayer.clearUrl(landmark.audio)];
        lodash.forEach(landmark.images, function (images) {
            promises.push(cacheLayer.clearUrl(images.full).then(function (newUrl) {
                images.full = newUrl;
            }));
            promises.push(cacheLayer.clearUrl(images.squareThumb).then(function (newUrl) {
                images.squareThumb = newUrl;
            }));
            promises.push(cacheLayer.clearUrl(images.thumb).then(function (newUrl) {
                images.thumb = newUrl;
            }));
        });
        return $q.all(promises);
    };
    $scope.refresh = function () {
        $scope.landmarks = [];
        $scope.tours = [];
        return $q.all([
            server.getAll('landmarks')
                .then(function (result) {
                    $scope.landmarks = result;
                }),
            server.getAll('tours')
                .then(function (tours) {
                    $scope.tours = tours;
                })
        ]).then(function () {
            lodash.forEach($scope.tours, function (tour) {
                tour.landmarks = lodash.map(tour.landmarks, function (landmarkA) {
                    return lodash.find($scope.landmarks, function (landmarkB) {
                        return landmarkB.id === landmarkA.id;
                    });
                });
            });
        });
    };
}).controller('pageCtrl', function ($scope, $stateParams) {
    "use strict";
    $scope.page = $stateParams.page;
}).controller('landmarksCtrl', function ($scope, $state, server, $q, utils, lodash, leafletData, $stateParams, $log) {
    // number of items to show in the list. Increased as user scrolls down
    "use strict";
    // the map. Needed this so we can invalidate its size if it gets in a bad state.
    var map,
        // the user's location
        location,
        ALL_TAGS = 'Show all',
        pageSize,
        currentPage;
    leafletData.getMap().then(function (result) {
        map = result;
    }, function (error) {
        $log.error("Couldn't locate map: " + angular.toJson(error));
    });
    function inval() {
        if (map) {
            map.invalidateSize();
        }
    }
    
    function markerForIndex(index) {
        var landmark = $scope.landmarks[index];
        return {
            lat: landmark.location.lat,
            lng: landmark.location.lng,
            message: "<div class='info-window' dotdotdot ng-click='go(landmarks[" + index + "])'>" + "<h6>" + landmark.name + "</h6>" + landmark.lede + "</div>",
            getMessageScope: function () {
                return $scope;
            },
            focus: false,
            icon: {
                iconUrl: "img/pin.png",
                iconSize: [21, 30], // size of the icon
                iconAnchor: [10.5, 30], // point of the icon which will correspond to marker's location
                popupAnchor: [0, -30] // point from which the popup should open relative to the iconAnchor
            }
        };
    }
    
    //  When navigating back to a map, the tiles will sometimes
    //  only render in the top left corner. Making the map resize
    //  itself fixes the issue
    $scope.$on('$ionicView.afterEnter', function () {
        inval();
    });
    
    $scope.$on('$ionicView.enter', function () {
        // constraints on which landmarks to show
        $scope.filter = {
            text: '',
            tag: $stateParams.tag || ALL_TAGS
        };
        $scope.applyFilter();
    });
    
    
    $scope.getNextPage = function () {
        
        $scope.loadingMsg = "Getting more Landmarks...";
        server.getLandmarks(location, currentPage + 1, pageSize)
            .then(function (newLandmarks) {
            if (newLandmarks.length) {
                lodash.forEach(newLandmarks, function (newLandmark) {
                    $scope.landmarks.push(newLandmark);
                    $scope.markers.push(markerForIndex($scope.landmarks.length - 1));
                });
                currentPage += 1;
            } else {
                $scope.hasNextPage = false;
            }
        }).finally(function () {
            $scope.loadingMsg = undefined;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
    // Number of kilometers to display, rounded to two Significant figures.
    // If this cannot be calculated (e.g. one of the locations is missing),
    // return undefined
    $scope.displayDistance = function (landmark) {
        if (location && landmark && landmark.location) {
            var dist = utils.distance(location, landmark.location);
            if (dist >= 0) {
                return Number(dist).toPrecision(2);
            }
        }
        return undefined;
    };
    $scope.refresh = function () {
        $scope.landmarks = [];
        $scope.markers = [];
        $scope.errorMessage = '';
        $scope.loadingMsg = 'Getting your location...';
        $scope.hasNextPage = true;
        currentPage = 0;
        pageSize = 0;
        //try to get the user's position
        utils.getPosition({
            //we can accept an old result - stalling here shoud be avoided
            maximumAge: 60000,
            timeout: 5000,
            enableHighAccuracy: true
        }).then(function (result) {
            $scope.loadingMsg = 'Getting Landmarks...';
            location = result;
            return server.getLandmarks(location);
        }, function (error) {
            //if we can't get the position, just carry on without it.
            $scope.loadingMsg = 'Getting Landmarks...';
            return server.getLandmarks();
        }).then(function (result) {
            $scope.landmarks = result;
            currentPage = 1;
            pageSize = result.length;
            $scope.loadingMsg = '';
            $scope.tags = lodash.union([ALL_TAGS], lodash.flatten(lodash.map(result, 'tags')));
            $scope.markers = lodash.times(result.length, markerForIndex);
            $scope.applyFilter();
        }).catch(function (error) {
            $scope.loadingMsg = '';
            $scope.errorMessage = error;
        });
    };
    $scope.refresh();
    $scope.$root.$on('$cordovaNetwork:online', $scope.refresh);

        // display the map centered on citadel hill.
        // UX: The map is the first thing people see when opening the app.
        //     What will they want to see? Where they are, or where the landmarks are?
    $scope.mapInfo = {
        lat: 44.6474,
        lng: -63.5806,
        zoom: 15
    };
    
    // list of tags which can be selected from
    $scope.tags = [ALL_TAGS];
    
    //false if a landmark is being filtered out, otherwise true
    $scope.showLandmark = function (landmark) {
        var nameMatch, tagMatch;
        if (!$scope.filter) {
            return true;
        }
        if (!$scope.filter.text) {
            nameMatch = true;
        } else {
            nameMatch = landmark.name.toLowerCase().indexOf($scope.filter.text.toLowerCase()) >= 0;
        }
        
        if ($scope.filter.tag === ALL_TAGS) {
            tagMatch = true;
        } else {
            tagMatch = lodash.includes(landmark.tags, $scope.filter.tag);
        }
        return tagMatch && nameMatch;
    };
    // show or hide markers according to whether or not their corresponding
    // landmarks should be filtered out
    $scope.applyFilter = function () {
        lodash.times($scope.markers.length, function (index) {
            var marker = $scope.markers[index],
                landmark = $scope.landmarks[index];
            if ($scope.showLandmark(landmark)) {
                marker.opacity = 1;
            } else {
                marker.opacity = 0;
                marker.focus = false;
            }
        });
        $scope.$root.$emit('truncate');
    };
    $scope.clearFilter = function () {
        $scope.filter.text = '';
        $scope.applyFilter();
    };
    //  Go to landmark view for the given landmark
    $scope.go = function (landmark) {
        $state.go('app.landmarkView', {
            landmarkID: landmark.id
        });
    };
}).controller('toursCtrl', function ($scope, $state, $q, $log, server, utils, lodash) {
    "use strict";
    var location,
        pageSize,
        currentPage;
    
    
    
    
    $scope.getNextPage = function () {
        var promise;
        if (location) {
            promise = server.getTours(location, currentPage + 1, pageSize);
        } else {
            promise = server.getTours(currentPage + 1, pageSize);
        }
        $scope.loadingMsg = "Getting more Tours...";
        promise.then(function (newTours) {
            if (newTours.length) {
                lodash.forEach(newTours, function (newTour) {
                    $scope.tours.push(newTour);
                });
                currentPage += 1;
            } else {
                $scope.hasNextPage = false;
            }
        }).finally(function () {
            $scope.loadingMsg = undefined;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
    
    $scope.loadingMsg = '';
        // When the view is entered, try to get the user's location.
        // If successful, use it to get the tours from the server
        // in order of nearness. Otherwise, get the tours in arbitrary order
    $scope.refresh = function () {
        location = undefined;
        $scope.tours = [];
        $scope.loadingMsg = 'getting your location...';
        $scope.errorMsg = '';
        currentPage = 0;
        pageSize = 0;
        utils.getPosition({
            //we can accept an old result - stalling here shoud be avoided
            maximumAge: 60000,
            timeout: 5000,
            enableHighAccuracy: true
        }).then(function (result) {
            location = result;
            $scope.loadingMsg = 'getting tours...';
            return server.getTours(location);
        }, function (error) {
            $log.warn("getPosition failed - retrieving tours anyway");
            $scope.loadingMsg = 'getting tours...';
            return server.getTours();
        }).then(function (result) {
            
            currentPage = 1;
            pageSize = result.length;
            $scope.loadingMsg = '';
            $scope.tours = result;
        }, function (error) {
            $scope.loadingMsg = '';
            $scope.errorMsg = error;
        });
    };
    $scope.refresh();
    $scope.$root.$on('$cordovaNetwork:online', $scope.refresh);
    // Number of kilometers to display, rounded to two decimal points.
    // If this cannot be calculated (e.g. one of the locations is missing)
    // return undefined
    $scope.displayDistance = function (tour) {
        if (location && tour && tour.start) {
            var dist = utils.distance(location, tour.start);
            if (dist >= 0) {
                return Number(dist).toPrecision(2);
            }
        }
        return undefined;
    };
    //ngModel doesn't work without a dot
    $scope.filter = {
        text: ''
    };
    $scope.go = function (tour) {
        $state.go('app.tourView', {
            tourID: tour.id
        });
    };
    // false if a tour is filtered out, otherwise true
    $scope.showTour = function (tour) {
        if (!$scope.filter.text) {
            return true;
        }
        return tour.name.toLowerCase().indexOf($scope.filter.text.toLowerCase()) >= 0;
    };
}).controller('landmarkCtrl', function ($scope, $state, $stateParams, server, $ionicTabsDelegate, $timeout, $ionicModal, mediaPlayer, $ionicScrollDelegate) {
    // UX: The screen is pretty empty when this opens. Could pass the image 
    //     in to display background immediately?
    "use strict";
    var modal,
        marker = {};
    // description tab
    // expose the track name to the view
    $scope.media = mediaPlayer;
    $scope.playAudio = function () {
        mediaPlayer.setTrack($scope.landmark.audio, $scope.landmark.name);
        mediaPlayer.play();
    };
    
    $scope.go = function (tag) {
        $state.go('app.tag', {tag: tag});
    };
    //Images tab
    $ionicModal.fromTemplateUrl('components/imageView/imageView.html', {
        scope: $scope,
        animation: 'none'
    }).then(function (constructedModal) {
        modal = constructedModal;
    });
    function openModal() {
        modal.show();
    }
    // display an image in the image modal
    $scope.display = function (image) {
        $scope.imageSrc = image.full;
        $scope.imageTitle = image.title;
        $scope.imageDescription = image.description;
        $scope.imageAnimation = "fade-appear";
        $scope.backgroundAnimation = "frost-appear";
            // let the class register to avoid flicker
        $timeout().then(openModal);
    };
    // make sure the zombie is dead
    // also, zoom in or back out
    $scope.doubleTap = function (event) {
        var delegate = $ionicScrollDelegate.$getByHandle('zoom-pane');
        if (delegate) {
            if (delegate.getScrollPosition().zoom === 1) {
                delegate.zoomBy(2, true);
            } else {
                delegate.zoomTo(1, true);
            }
        }
    };
    $scope.closeModal = function () {
        $scope.imageAnimation = "fade-disappear";
        $scope.backgroundAnimation = "frost-disappear";
            // It takes 1 second to fade out
        $timeout(1000).then(function () {
            modal.hide();
            $scope.imageSrc = undefined;
            $scope.imageTitle = undefined;
            $scope.imageDescription = undefined;
            $ionicScrollDelegate.$getByHandle('zoom-pane').zoomTo(1);
        });
    };
    // Map tab
    $scope.markers = [marker];
    $scope.mapInfo = {
        lat: 0,
        lng: 0,
        zoom: 13
    };
    function updateMarker() {
        if (!marker.lat) {
            // we are generating the marker for the first time
            // breaks if the marker is on the equator
            angular.extend(marker, {
                lat: $scope.landmark.location.lat,
                lng: $scope.landmark.location.lng,
                focus: false,
                clickable: false,
                icon: {
                    iconUrl: "img/pin.png",
                    iconSize: [21, 30], // size of the icon
                    iconAnchor: [10.5, 30], // point of the icon which will correspond to marker's location
                    popupAnchor: [0, -30] // point from which the popup should open relative to the iconAnchor
                }
            });
        } else {
            marker.lat = $scope.landmark.location.lat;
            marker.lng = $scope.landmark.location.lng;
        }
        $scope.mapInfo.lat = marker.lat;
        $scope.mapInfo.lng = marker.lng;
    }
    $scope.refresh = function () {
        $scope.loadingMsg = 'Getting landmark info...';
        $scope.errorMsg = '';
        server.landmarkInfo($stateParams.landmarkID).then(function (landmark) {
            $scope.landmark = landmark;
        }).catch(function (error) {
            $scope.errorMsg = error;
        }).finally(function () {
            updateMarker();
                //UX: On failure go back to previous page, plus an error toast?
            $scope.loadingMsg = '';
        });
    };
    $scope.refresh();
    $scope.$root.$on('$cordovaNetwork:online', $scope.refresh);
}).controller('tourCtrl', function ($scope, $stateParams, server, $state, $q, $timeout, lodash) {
    "use strict";
    function iconFor(index) {
        var icon = {
            iconSize : [21, 30], // size of the icon
            iconAnchor : [10.5, 30], // point of the icon which will correspond to marker's location
            popupAnchor : [0, -30] // point from which the popup should open relative to the iconAnchor
        };
        
        
        if (index === $scope.currentLandmark) {
            icon.iconUrl = "img/pin.png";
        } else {
            icon.iconUrl = "img/small-pin.png";
        }
        return icon;
    }
    function updateIcon(index) {
        angular.extend($scope.markers[index].icon, iconFor(index));
    }
    $scope.markers = [];
    $scope.mapInfo = {
        lat: 44.6474,
        lng: -63.5806,
        zoom: 15
    };
    // index of the current landmark (the one user will visit next)
    $scope.currentLandmark = 0;
    // utility method for going to a landmark and moving the position in 
    // the tour appropriately
    $scope.goTo = function (destIndex) {
        $scope.currentLandmark = destIndex;
        lodash.times($scope.markers.length, function (i) {
            updateIcon(i);
        });
    };
    // can we move forward?
    $scope.hasNext = function () {
        return $scope.currentLandmark < $scope.tour.landmarks.length - 1;
    };
    // can we move backward?
    $scope.hasPrev = function () {
        return $scope.currentLandmark > 0;
    };
    // advancing the current landmark (but not navigating to it)
    $scope.toNext = function () {
        if ($scope.hasNext()) {
            $scope.currentLandmark += 1;
            updateIcon($scope.currentLandmark);
            updateIcon($scope.currentLandmark - 1);
        }
    };
    // retracting the current landmark (but not navigating to it)
    $scope.toPrev = function () {
        if ($scope.hasPrev()) {
            $scope.currentLandmark -= 1;
            updateIcon($scope.currentLandmark + 1);
            updateIcon($scope.currentLandmark);
        }
    };
    $scope.go = function (landmark) {
        $state.go('app.landmarkView', {
            landmarkID: landmark.id
        });
    };
    $scope.refresh = function () {
        server.tourInfo($stateParams.tourID).then(function (tour) {
            //TODO pan to the start of the tour
            $scope.tour = tour;
            $scope.loadingMsg = 'Getting landmarks';
            $scope.errorMsg = '';
            var promises = [];
            lodash.times($scope.tour.landmarks.length, function (index) {
                promises.push(server.landmarkInfo($scope.tour.landmarks[index].id).then(function (landmark) {
                    angular.extend($scope.tour.landmarks[index], landmark);
                }));
            });
            return $q.all(promises).then(function () {
                lodash.times($scope.tour.landmarks.length, function (i) {
                    $scope.markers[i] = {
                        lat: $scope.tour.landmarks[i].location.lat,
                        lng: $scope.tour.landmarks[i].location.lng,
                        message: "<span ng-click='goTo(" + i + ")'>" + $scope.tour.landmarks[i].name + "</span>",
                        getMessageScope: function () {
                            return $scope;
                        },
                        focus: false,
                        icon: iconFor(i)
                    };
                });
            });
        }).catch(function (error) {
            //UX: back to previous page, plus an error toast?
            $scope.errorMsg = error;
        }).finally(function () {
            $scope.loadingMsg = '';
        });
    };
    // TODO should be in an onEnter callback
    $scope.refresh();
    $scope.$root.$on('$cordovaNetwork:online', $scope.refresh);
});