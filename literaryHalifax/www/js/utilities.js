angular.module('literaryHalifax')

/*
 * This file is a dumping ground for reused code.
 */
.factory('utils', function($q, $ionicPlatform){
    
    
    
    var utils={
        // returns the distance between two lat/lng objects, in kilometers.
        // To perform this calculation quickly, we treat the earth as flat.
        // 111.1km/lat, 79.3km/lng is specific to Halifax, so the distances 
        // will be inaccurate from far away
        distance:function(from,to){
            if(!(from.lat&&from.lng&&to.lat&&to.lng)){
                console.log('bad lat/lng format')
                return -1
            }
            dLat = from.lat-to.lat
            dLng = from.lng-to.lng
            squarekms = Math.pow((dLat*111.1),2) + Math.pow((dLng*79.3),2)
            return Math.sqrt(squarekms)
        },
        
        // returns a promise which resolves to a lat/lng object
        // the error format is not well defined
        getPosition:function(options){
            var deferred = $q.defer()
            
            $ionicPlatform.ready(function(){
                if(navigator.geolocation){
                    navigator.geolocation.getCurrentPosition(
                        function(currentPosition){
                            deferred.resolve({
                                lat: currentPosition.coords.latitude,
                                lng:currentPosition.coords.longitude
                            })
                        },
                        function(error){
                            deferred.reject(error)
                        },
                        options
                    )
                } else {
                    deferred.reject("No navigator!")
                }
            })
            
            return deferred.promise
        }
    }
    
    
    return utils
})

// an element with the dotdotdot attribute will truncate text with ellipses
.directive('dotdotdot', function() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$evalAsync(function () {
                    element.dotdotdot({
                        wrap: 'letter'
                    });
                });
            }
        };
})