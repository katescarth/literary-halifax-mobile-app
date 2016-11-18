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


  loadImage = function(index, imageFile){
    xhr = new XMLHttpRequest();
    xhr.open("GET", imageFile, true);
    xhr.responseType = "blob";
    xhr.onload = function (e){
            var reader = new FileReader();
            reader.onload = function(event) {
               var res = event.target.result;
               places[index].images.push(res)
            }
            var file = this.response;
            reader.readAsDataURL(file)
    };
    xhr.send()
  }


  var places = [
    {
      name:"Halifax Central Library",
      location:"44.6431,-63.5752",
      id: "place-id-1",
      images:[]
    },
    {
      name:"Public Gardens",
      location:"44.6428,-63.5821",
      id: "place-id-2",
      images:[]
    },
    {
      name:"The Dingle",
      location:"44.6304,-63.6028",
      id: "place-id-3",
      images:[]
    },
    {
      name:"Old Burying Ground",
      location:"44.6437,-63.5728",
      id: "place-id-4",
      images: []
    }
  ]

  loadImage(3,"/img/OBG2.png")
  loadImage(3,"/img/OBG1.png")

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
