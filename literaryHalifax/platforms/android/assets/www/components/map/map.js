angular.module('literaryHalifax').directive('markerMap', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                // a location (lat/lng, address...)
                center: '='
                , // an integer which represents how far in the map should be zoomed
                // 0 is the lowest zoom level
                zoom: '='
                , //a unique identifier to be applied to the map. Must be a number.
                  // use NgMap.getMap(mapHandle) to find the map (e.g. to show an info window)
                mapHandle:'='
            },
            templateUrl: 'components/map/map.html'
        };
    }).directive('userLocationMarker', function () {
        return {
            retrict:'E',
            scope: {},
            controllerAs:'ctrl',
            controller:function($scope,$element, $attrs, $transclude){
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
                } else {
                    console.log('no navigator!')
                }
                
            },
            templateUrl: 'components/map/userLocationMarker.html'
        };
    }).controller('mapCtrl', function ($scope, $ionicScrollDelegate, $interval, NgMap) {
        // see https://developers.google.com/maps/documentation/javascript/style-reference#style-elements
        console.log($scope.mapHandle)
        console.log($scope.center)
        console.log($scope.zoom)
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
            },
            {
                featureType: "road.highway",
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