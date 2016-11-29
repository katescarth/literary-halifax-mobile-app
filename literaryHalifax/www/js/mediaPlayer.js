angular.module('literaryHalifax')

/*
 */
.factory('mediaPlayer', function($timeout){

    var player = undefined
    
    var track = undefined
    var media = undefined
    
    var listeners = []
    
    play=function(){
        player.isPlaying=true
        media.play()//TODO add  iOS options
    }
    pause=function(){
        player.isPlaying=false
        media.pause()
    }
    stop=function(){
        player.hasTrack=false
        player.isPlaying=false
        if(media){
            media.stop()
            media.release()
        }
        track=undefined
        media=undefined
    }
    setTrack=function(newTrack){
        stop()
        track=newTrack
        player.hasTrack=true
        media=new Media(track, function(){
            $timeout(function(){
                stop()
            },0,true)
        })
    }

    player = {
        setTrack:setTrack,
        play:play,
        pause:pause,
        stop:stop,
        isPlaying:false,
        hasTrack:false
    }

    return player
})
