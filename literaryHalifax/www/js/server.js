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
      id: "place-id-1",
      images:["/img/HCL1.jpg"]
    },
    {
      name:"Public Gardens",
      location:"44.6428,-63.5821",
      id: "place-id-2",
      images:["/img/PBG1.jpg"]
    },
    {
      name:"The Dingle",
      location:"44.6304,-63.6028",
      id: "place-id-3",
      images:["/img/DNG1.jpg"]
    },
    {
      name:"Old Burying Ground",
      location:"44.6437,-63.5728",
      id: "place-id-4",
      images: [
        "/img/OBG1.png",
        "/img/OBG2.png"
      ]
    }
  ]



  server = {
    getPlaces:function(attrs){

      result = []

      for(i=0;i<places.length;i++){
        place = places[i]
        clone = {}
        for(j=0;j<attrs.length;j++){
          clone[attrs[j]] =place[attrs[j]]
        }
        result.push(clone)
      }

      return $timeout(function(){
        console.log(result)
        return result
      }, SMALL_DELAY)

    },
    placeInfo:function(id, attributes){
      result = {}
      for(i=0;i<places.length;i++){

        if(places[i].id==id){
            for(j=0;j<attributes.length;j++){
              result[attributes[j]] =places[i][attributes[j]]
            }

            return $timeout(function(){
              return result
            }, LARGE_DELAY)
        }
      }
    },
    updatePlace:function(place,attributes){
      return this.placeInfo(place.id, attributes)
      .then(
        function(newAttrs){
          for(attr in newAttrs){
            place[attr]=newAttrs[attr]
          }
        }
      )
    }
  }

  return server
})
