angular.module('literaryHalifax')

/*
 */
.factory('utils', function(){
    
    
    
    var utils={
        distance:function(from,to){
            if(!(from.lat&&from.lng&&to.lat&&to.lng)){
                console.log('bad lat/lng format')
                return -1
            }
            dLat = from.lat-to.lat
            dLng = from.lng-to.lng
            squarekms = Math.pow((dLat*111.1),2) + Math.pow((dLng*79.3),2)
            return Math.sqrt(squarekms)
        }
    }
    
    
    return utils
})