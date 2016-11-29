angular.module('literaryHalifax')

/*
 * Right now, this is all fixture data. The purpose of this code is to separate
 * the rest of the app from the server (this is the only part of the code that
 * knows there's not actually a server)

 * Spec for story:
 *  id: a unique identifier (str)
 *  name: The name of the story (str)
 *  location: the lat,lng of the story (str) TODO update to numerical data
 *  description: text description of the story (array[str]. Each element is a
                 paragraph)
 *  images: a list of images associated with the story. The first image is the
            thumbnail/main image (array[image])
 *  audio:  an audio reading of the stroy's description
 *
 
 *Spec for server: 

 * getStories(): resolves to a list of stories. The stories have ids, locations,
                and names - enough  info to display in a list without further
                requests.
 * storyInfo(id, attributes): resolves to an object with all of the properties
                              listed in attributes (a string array). The values
                              for these properties are copied from the story
                              matching id
 */
.factory('mediaPlayer', function($timeout){


    
    var track = undefined

    player = {
        setTrack:function(newTrack){
            track=newTrack

        },
        play:function(){
            
        },
        pause:function(){
            
        },
        stop:function(){
            track=undefined
        },
        isPlaying:function(){
            
        },
        hasTrack:function(){
            return track?true:false
        }
    }

    return player
})
