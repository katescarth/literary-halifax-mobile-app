/*global angular */
angular.module('literaryHalifax')
    // The scope containing a marker map MUST use the "redrawMap" service to ensure the map is always displayed correctly
    .directive('markerMap', function () {
        "use strict";
        return {
            restrict : 'E',
            scope : {
                // An object with lat, lng, and zoom properties. The view window of the map
                // will always reflect these properties. Note that this means the user scrolling
                // on the map willl update the properties
                mapInfo : '=',
                // a unique identifier to be applied to the map. Must be a number.
                mapHandle : '=',
                //A list of markers to display on the map
                mapMarkers : '='

            },
            templateUrl : 'components/map/map.html'
        };
    }).controller('mapCtrl', function ($scope, $ionicScrollDelegate, $ionicPlatform, utils, $q, $timeout, $cordovaNetwork, $log, mapCache, leafletData) {
        "use strict";
    //    must wait for all markers to be available before passing them in
        $scope.userLocationMarker = {
            focus : false,
            clickable : false,
            lat : 0,
            lng : 0,
            opacity : 0,//not visible until location is set
            icon : {
                iconUrl : "img/blue-circle.png",
                iconSize : [8, 8],
                iconAnchor : [4, 4]
            }
        };
        // display the union of passed-in markers and the user location marker
        // leaflet is pretty picky about markers. It is important to never resize a marker, so the user location
        // marker is always first.
        $scope.$watch("mapMarkers", function (newValue, oldValue) {
            $scope.$evalAsync(function () {
                $scope.markers = [$scope.userLocationMarker].concat(newValue);
            });
        }, true);
        utils.watchPosition(
            function (result) {
                angular.extend($scope.userLocationMarker,
                    {
                        lat : result.coords.latitude,
                        lng : result.coords.longitude,
                        opacity : 1
                    });

            },
            function (error) {
                $log.error("Error watching position: " + angular.toJson(error));
            },
            {
                maximumAge : 3000,
                timeout : 5000,
                enableHighAccuracy : true
            }
        );

        // regularly update the user location marker's position 

        //prevent scrolling when touching the map
        $scope.fingerDown = function () {
            $ionicScrollDelegate.freezeAllScrolls(true);
        };
        $scope.fingerUp = function () {
            $ionicScrollDelegate.freezeAllScrolls(false);
        };

        $scope.tiles = {
            url: function (arg) {
                return $ionicPlatform.ready().then(function () {
                    return mapCache.urlFor(arg.tile.column, arg.tile.row, arg.zoom, arg.subdomain);
                });
            }
        };

    }).factory("redrawMap", function ($log, $timeout, lodash) {
        "use strict";
        // passing a scope to this function adds an "afterEnter" listener that invalidates the map
        // the map can also be redrawn directly using $scope.manualRedraw()
        return function (foreignScope) {
            function redraw() {
                foreignScope.$broadcast("invalidateSize");
            }
            foreignScope.manualRedraw = function () {
                $timeout(redraw);
            };
            foreignScope.$on("$ionicView.afterEnter", redraw);
        };
    });