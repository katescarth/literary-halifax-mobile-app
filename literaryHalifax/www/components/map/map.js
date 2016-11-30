angular.module('literaryHalifax').directive('markerMap', function () {
        return {
            restrict: 'E'
            , scope: {
                // a collection of 'story' objects which have at least
                // id: a unique id
                // location: a location (lat/lng, address...)
                stories: '='
                , // true to display info windows, false otherwise
                infoWindows: '='
                , // the name of the directive to display in the infoWindow. The directive
                // will receive the selected place in the 'place' attribute.
                windowDirective: '@'
                , // a location (lat/lng, address...)
                center: '='
                , // an integer which represents how far in the map should be zoomed
                // 0 is the lowest zoom level
                zoom: '='
                , //set to true to make the map center on a marker when it is clicked
                centerOnClick: '='
            }
            , templateUrl: 'components/map/map.html'
        };
    })
    //This is a simple directive which replaces itself with the directive named
    // in windowType
    .directive('infoWindowSelector', function ($compile) {
        return {
            scope: {
                windowType: '@'
                , story: '='
            }
            , link: function (scope, element) {
                var generatedTemplate = '<' + scope.windowType + ' story="story"></' + scope.windowType + '>';
                //this function is getting called more than once, so we need to clear out
                //the element each time
                //TODO get this function called only once
                element.empty()
                element.append($compile(generatedTemplate)(scope));
            }
        };
    }).controller('mapCtrl', function ($scope, $ionicScrollDelegate, $interval, NgMap) {
        $scope.id = "marker-map-id"
        // see https://developers.google.com/maps/documentation/javascript/style-reference#style-elements
        $scope.styles=[
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            },
            {
                featureType: "poi.park",
                elementType: "labels",
                stylers: [
                    { visibility: "on" }
                ]
            },
            {
                featureType: "administrative",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            },
            {
                featureType: "administrative.neighborhood",
                elementType: "labels",
                stylers: [
                    { 
                        visibility:"on"
                    }
                ]
            },
            {
                featureType: "transit",
                stylers: [
                    { visibility: "off" }
                ]
            }
        ]
        
        $scope.$on('$ionicView.enter', function() {
            NgMap.getMap($scope.id).then(function (map) {
                $scope.map = map;
            }, function (error) {
                console.log(error)
            });
        });
        
        //prevent scrolling when touching the map
        $scope.fingerDown = function () {
            $ionicScrollDelegate.freezeAllScrolls(true)
        }
        $scope.fingerUp = function () {
                $ionicScrollDelegate.freezeAllScrolls(false)
            }
        //utility function for converting string representations of lat/lng into abjects
        // with the format {lat:30,lng:-60}
        coordinates = function (location) {
            tmp = location.split(',')
            return {
                lat: parseFloat(tmp[0])
                , lng: parseFloat(tmp[1])
            }
        }
    
        if(navigator.geolocation){
            navigator.geolocation.watchPosition(
                function(result){
                    $scope.userLocation = {
                        lat:result.coords.latitude,
                        lng:result.coords.longitude
                    }
                }, function(error){
                    console.log(error)
                }, { timeout: 30000 }
            )
        }
    
        //display an info window.
        handleStoryClicked = function (story) {
            // make the currently selected place available to the info window
            $scope.story = story
            $scope.map.showInfoWindow('infoWindow', story.id)
            if ($scope.centerOnClick) {
                $scope.map.panTo(coordinates(story.location))
            }
        }
        $scope.markerClicked = function (element, story) {
            handleStoryClicked(story)
        }
    })