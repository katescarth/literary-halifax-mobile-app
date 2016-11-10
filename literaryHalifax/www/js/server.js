angular.module('literaryHalifax')
.factory('server', function($timeout){
  var SMALL_DELAY = 200
  var LARGE_DELAY = 2000
  server = {
    getPlaces:function(){
      return $timeout(function(){
        return [
          {
            name:"Halifax Central Library",
            location:"44.6431,-63.5752",
            id: "place-id-1"
          },
          {
            name:"Public Gardens",
            location:"44.6428,-63.5821",
            id: "place-id-2"
          },
          {
            name:"The Dingle",
            location:"44.6304,-63.6028",
            id: "place-id-3"
          }
        ]
      },SMALL_DELAY)

    }
  }

  return server
})
