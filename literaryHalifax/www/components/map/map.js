angular.module('literaryHalifax').directive('markerMap', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                // a location (lat/lng, address...) TODO RENAME THIS BECAUSE IT BREAKS EVERYTHING
                mapCenter: '='
                , // an integer which represents how far in the map should be zoomed
                // 0 is the lowest zoom level
                mapZoom: '='
                , //a unique identifier to be applied to the map. Must be a number.
                  // use NgMap.getMap(mapHandle) to find the map (e.g. to show an info window)
                mapHandle:'=',
                //A list of markers to display on the map
                mapMarkers:'='
                
            },
            templateUrl: 'components/map/map.html'
        };
    }).directive('userLocationMarker', function () {
        return {
//            retrict:'E',
//            scope: {},
//            controllerAs:'ctrl',
//            controller:function($scope,$element, $attrs, $transclude){
//                if(navigator.geolocation){
//                    navigator.geolocation.watchPosition(
//                        function(result){
//                            $scope.userLocation = {
//                                lat:result.coords.latitude,
//                                lng:result.coords.longitude
//                            }
//                        }, function(error){
//                            console.log(error)
//                        }, {maximumAge:3000, timeout: 5000, enableHighAccuracy:true}
//                    )
//                } else {
//                    console.log('no navigator!')
//                }
//                
//            },
//            templateUrl: 'components/map/userLocationMarker.html'
        };
    }).controller('mapCtrl', function ($scope, $ionicScrollDelegate, $interval) {
    
        // see https://developers.google.com/maps/documentation/javascript/style-reference#style-elements
        $scope.styles=[
            {
                featureType: "poi", // points of interest. In general, we don't want their labels diplayed
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            },
            {
                featureType: "poi.park",// parks, however, should be displayed
                elementType: "labels",
                stylers: [
                    { visibility: "on" }
                ]
            },
            {
                featureType: "administrative",//countries, cities, etc. Not of interest
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            },
            {
                featureType: "administrative.neighborhood",// South end, North end...
                elementType: "labels",
                stylers: [
                    { 
                        visibility:"on"
                    }
                ]
            },
            {
                featureType: "transit", // bus stops and the like. Remove labels AND map elements
                stylers: [
                    { visibility: "off" }
                ]
            },
            {
                featureType: "road.highway", // large roads, don't need to display the name
                elementType:"labels",
                stylers: [
                    { visibility: "off" }
                ]
            }
        ]
        
        //prevent scrolling when touching the map
        $scope.fingerDown = function () {
            $ionicScrollDelegate.freezeAllScrolls(true)
        }
        $scope.fingerUp = function () {
            $ionicScrollDelegate.freezeAllScrolls(false)
        }
    })