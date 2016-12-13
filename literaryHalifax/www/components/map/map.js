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
    }).controller('mapCtrl', function ($scope, $ionicScrollDelegate) {
    
        $scope.userLocationMarker = {
            focus: false,
            clickable: false,
            lat:0,
            lng:0,
            opacity:0,//not visible until location is set
            icon: {
                iconUrl: "img/Air.png",
                iconSize:     [10,10],
                iconAnchor:   [5,5]
            }
        }
        
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
                            opacity:1
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
        
        
        
        $scope.tiles ={
//            name: 'OpenStreetMap',
            url: 'https://api.mapbox.com/v4/{mapID}/{z}/{x}/{y}.png?access_token={apikey}',
//            type: 'xyz',
            options: {
                // TODO: This is David Walker's key, get our own for production
                apikey: 'pk.eyJ1IjoiZHdhbGtlcmhhbGlmYXgiLCJhIjoiY2l3bzVieDNoMDAxdDJ6bXJzODg2cHF5OCJ9.AyPfYz71uJidlIqouYDNPA',
                mapID: 'mapbox.light'
            }

        }
    })