/*global angular */
angular.module('literaryHalifax')

    /*
     * This file is a dumping ground for reused code.
     */
    .factory('utils', function ($q, $ionicPlatform, $timeout, $log, localization) {

        "use strict";
        var utils = {},
            permissionsDeferred = $q.defer(),
            getPermissions = permissionsDeferred.promise;
        // set a hard(ish) time limit on a promise. If it hasn't resolved after the given
        // number of milliseconds, return a rejection. Note- this does not actually stop the 
        // promise from being carried out, so it should not be used with large, multi step promises.
        function timeoutWrapper(promise, millis) {
            var deferred = $q.defer();
            promise.then(
                function (result) {
                    deferred.resolve(result);
                },
                function (error) {
                    deferred.reject(error);
                }
            );
            $timeout(millis).then(function () {
                deferred.reject(localization.strings.errorMessageTimeout);
            });
            return deferred.promise;
        }


        // cordova diagnostics aren't working, so this is how we request location permissions.
        // concurrent requests are an issue, so wait until this one resolves before requesting
        // actual locations.
        $ionicPlatform.ready(function () {
            navigator.geolocation.getCurrentPosition(
                function (currentPosition) {
                    $log.info('Got geolocation permissions');
                    permissionsDeferred.resolve();
                },
                function (error) {
                    $log.error('Something went wrong getting geolocation permissions: ' + angular.toJson(error));
                    permissionsDeferred.resolve();
                },
                {
                    maximumAge : 60000,
                    timeout : 15000,
                    enableHighAccuracy : true
                }
            );
        });
    
        utils.watchPosition = function (success, failure, options) {
            if (navigator.geolocation) {
                getPermissions.then(function () {
                    navigator.geolocation.watchPosition(
                        success,
                        failure,
                        options
                    );
                });
            } else {
                $log.error('no navigator: watchPosition canceled');
            }
        };

        // returns the distance between two lat/lng objects, in kilometers.
        // To perform this calculation quickly, we treat the earth as flat.
        // 111.1km/lat, 79.3km/lng is specific to Halifax, so the distances 
        // will be inaccurate from far away
        utils.distance = function (from, to) {
            
            if (!(from.lat && from.lng && to.lat && to.lng)) {
                $log.error('bad lat/lng format');
                return -1;
            }
            
            var scale = Math.cos((180 / Math.PI) * (from.lat + to.lat) / 2),
                dXSquared = Math.pow((from.lat - to.lat) * localization.numbers.distancePerLatitudeLine, 2),
                dYSquared = Math.pow((from.lng - to.lng) * localization.numbers.distancePerLatitudeLine * scale, 2);
            return Math.sqrt(dXSquared + dYSquared);
        };

        // returns a promise which resolves to a lat/lng object
        // the error format is not well defined
        utils.getPosition = function (options) {
            var deferred = $q.defer();

            if (navigator.geolocation) {
                timeoutWrapper(getPermissions, options.timeout)
                    .then(function (success) {
                        navigator.geolocation.getCurrentPosition(
                            function (currentPosition) {
                                deferred.resolve({
                                    lat : currentPosition.coords.latitude,
                                    lng : currentPosition.coords.longitude
                                });
                            },
                            function (error) {
                                deferred.reject(error);
                            },
                            options
                        );
                    },
                        function (error) {
                            deferred.reject(error);
                        });
            } else {
                deferred.reject(localization.strings.errorMessageNoNavigator);
            }
            return deferred.promise;
        };
        return utils;
    })

    // an element with the dotdotdot attribute will truncate text with ellipses
    .directive('dotdotdot', function ($log) {
        "use strict";
        return {
            restrict : 'A',
            link : function (scope, element, attrs) {
                scope.$watch(function () {
                    return true && attrs.dotdotdot;
                }, function () {
                    scope.$evalAsync(function () {
                        element.dotdotdot({
                            wrap: 'letter'
                        });
                    });
                });
            }
        };
    });
