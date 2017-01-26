angular.module('literaryHalifax').directive('markerMap', function () {
        return {
            restrict: 'E',
            scope: {
                // An object with lat, lng, and zoom properties. The view window of the map
                // will always reflect these properties. Note that this means the user scrolling
                // on the map willl update the properties
                mapInfo: '=',
                // a unique identifier to be applied to the map. Must be a number.
                mapHandle:'=',
                //A list of markers to display on the map
                mapMarkers:'='
                
            },
            templateUrl: 'components/map/map.html'
        };
    }).controller('mapCtrl', function ($scope, $ionicScrollDelegate, $ionicPlatform, utils) {
    
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
        // display the union of passed-in markers and the user loocation marker
        $scope.$watch("mapMarkers", function (newValue, oldValue) {
                    $scope.markers = [$scope.userLocationMarker].concat(newValue)
                }, true);
    
    
        utils.watchPosition(
            function(result){
                angular.extend($scope.userLocationMarker,
                    {
                        lat:result.coords.latitude,
                        lng:result.coords.longitude,
                        opacity:1
                    }
                )

            },
            function(error){
                console.log(error)
            },
            {
                maximumAge:3000,
                timeout: 5000,
                enableHighAccuracy:true
            }
        )
    
        // regularly update the user location marker's position 
        
        //prevent scrolling when touching the map
        $scope.fingerDown = function () {
            $ionicScrollDelegate.freezeAllScrolls(true)
        }
        $scope.fingerUp = function () {
            $ionicScrollDelegate.freezeAllScrolls(false)
        }
        
        
//      The tileset used by Curatescape  
        
        
        
        $scope.tiles ={
            url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        }
        
    })