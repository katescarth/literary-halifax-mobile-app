angular.module('literaryHalifax').directive('markerMap', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                // An object with alt, lng, and zoom properties that determines the initial state
                mapInfo: '='
                , //a unique identifier to be applied to the map. Must be a number.
                  // use NgMap.getMap(mapHandle) to find the map (e.g. to show an info window)
                mapHandle:'=',
                //A list of markers to display on the map
                mapMarkers:'='
                
            },
            link: function ($scope, $elm, $attr) {

            },
            templateUrl: 'components/map/map.html'
        };
    }).controller('mapCtrl', function ($scope, $ionicScrollDelegate, $interval, lodash) {
    
        $scope.userLocationMarker = {}
        
        $scope.$watch("mapMarkers", function (newValue, oldValue) {
                    $scope.markers = [$scope.userLocationMarker].concat(newValue)
                }, true);
        
        if(navigator.geolocation){
            navigator.geolocation.watchPosition(
                function(result){
                    angular.extend($scope.userLocationMarker,
                        {
                            lat:result.coords.latitude,
                            lng:result.coords.longitude,
                            focus: false,
                            clickable: false,
                            icon: {
                                iconUrl: "img/Air.png",
                                iconSize:     [10,10], // size of the icon
                                iconAnchor:   [5,5], // point of the icon which will correspond to marker's location
                                popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
                            },
                        }
                    )
                    
                }, function(error){
                    console.log(error)
                }, {maximumAge:3000, timeout: 5000, enableHighAccuracy:true}
            )
        } else {
            console.log('no navigator!')
        }
        
        //prevent scrolling when touching the map
        $scope.fingerDown = function () {
            $ionicScrollDelegate.freezeAllScrolls(true)
        }
        $scope.fingerUp = function () {
            $ionicScrollDelegate.freezeAllScrolls(false)
        }
    })