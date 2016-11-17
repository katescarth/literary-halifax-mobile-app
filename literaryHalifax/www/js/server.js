angular.module('literaryHalifax')

/*
 * Right now, this is all fixture data. The purpose of this code is to separate
 * the rest of the app from the server (this is the only part of the code that
 * knows there's not actually a server)

 * Spec for place:
 *  id: a unique identifier (str)
 *  name: The name of the place (str)
 *  location: the lat,lng of the place (str) TODO update to numerical data
 *  description: text description of the place (str)
 *  images: a list of images associated with the place. The first image is the
            thumbnail/main image (array[image])
 *  audio:  a list of audio tracks associated with the place. array[audio]

 * getPlaces(): resolves to a list of places. The places have ids, locations,
                and names - enough  info to display in a list without later
                requests.
 * placeInfo(id, attributes): resolves to an object identical to attributes
                              but with properties identical to those of the
                              place with the given id. 
 *
 */
.factory('server', function($timeout){
  var SMALL_DELAY = 200
  var LARGE_DELAY = 2000

  var places = [
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

  server = {
    getPlaces:function(){

      result = []

      for(i=0;i<places.length;i++){
        place = places[i]
        result.push({
          name:place.name,
          location:place.location,
          id:place.id
        })
      }

      return $timeout(function(){
        return result
      }, SMALL_DELAY)

    }
  }

  return server
})
