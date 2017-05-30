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
            
            var scale = Math.cos((Math.PI / 180) * (from.lat + to.lat) / 2),
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
    })

// modified version of the ngCordova implementation of $cordovaMedia
// names have been changed to avoid confusion from $cordovaMedia to audioPlayer
// and from NewMedia to Player

//The MIT License (MIT)
//
//Copyright (c) 2014 Drifty
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//SOFTWARE.

// install   :      cordova plugin add cordova-plugin-media
// link      :      https://github.com/apache/cordova-plugin-media

.service('Player', ['$q', '$interval', function ($q, $interval) {
  var q, q2, q3, mediaStatus = null, mediaPosition = -1, mediaTimer, mediaDuration = -1;

  function setTimer(media) {
      if (angular.isDefined(mediaTimer)) {
        return;
      }

      mediaTimer = $interval(function () {
          if (mediaDuration < 0) {
              mediaDuration = media.getDuration();
              if (q && mediaDuration > 0) {
                q.notify({duration: mediaDuration});
              }
          }

          media.getCurrentPosition(
            // success callback
            function (position) {
                if (position > -1) {
                    mediaPosition = position;
                }
            },
            // error callback
            function (e) {
                console.log('Error getting pos=' + e);
            });

          if (q) {
            q.notify({position: mediaPosition});
          }

      }, 1000);
  }

  function clearTimer() {
      if (angular.isDefined(mediaTimer)) {
          $interval.cancel(mediaTimer);
          mediaTimer = undefined;
      }
  }

  function resetValues() {
      mediaPosition = -1;
      mediaDuration = -1;
  }

  function Player(src) {
      this.media = new Media(src,
        function (success) {
            clearTimer();
            resetValues();
            q.resolve(success);
        }, function (error) {
            clearTimer();
            resetValues();
            q.reject(error);
        }, function (status) {
            mediaStatus = status;
            q.notify({status: mediaStatus});
        });
  }

  // iOS quirks :
  // -  myMedia.play({ numberOfLoops: 2 }) -> looping
  // -  myMedia.play({ playAudioWhenScreenIsLocked : false })
  Player.prototype.play = function (options) {
      q = $q.defer();

      if (typeof options !== 'object') {
          options = {};
      }

      this.media.play(options);

      setTimer(this.media);

      return q.promise;
  };

  Player.prototype.pause = function () {
      clearTimer();
      this.media.pause();
  };

  Player.prototype.stop  = function () {
      this.media.stop();
  };

  Player.prototype.release  = function () {
      this.media.release();
      this.media = undefined;
  };

  Player.prototype.seekTo  = function (timing) {
      this.media.seekTo(timing);
  };

  Player.prototype.setVolume = function (volume) {
      this.media.setVolume(volume);
  };

  Player.prototype.startRecord = function () {
      this.media.startRecord();
  };

  Player.prototype.stopRecord  = function () {
      this.media.stopRecord();
  };

  Player.prototype.currentTime = function () {
      q2 = $q.defer();
      this.media.getCurrentPosition(function (position){
      q2.resolve(position);
      });
      return q2.promise;
  };

  Player.prototype.getDuration = function () {
      // this is the change from the original ngCordova implementation. Their version treated media.getDuration as
      // and async callback function, so the promise never resolved.
    q3 = $q.defer();
    q3.resolve(this.media.getDuration());
    return q3.promise;
  };

  return Player;

}])
.factory('audioPlayer', ['Player', function (Player) {
  return {
      newMedia: function (src) {
          return new Player(src);
      }
  };
}]);