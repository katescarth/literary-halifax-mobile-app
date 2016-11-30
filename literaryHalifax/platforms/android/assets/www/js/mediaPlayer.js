angular.module('literaryHalifax')

/*
 * A single media player which handles one track at a time throughout the app
 *
 * the player exposes the variables isPlaying, hasTrack, progress, and title for fast binding
 *
 */
.factory('mediaPlayer', function($timeout, $interval){

    var player = undefined
    
    var media = undefined
    
    
    //plays the currently selected track
    play=function(){
        if(player.hasTrack){
            player.isPlaying=true
            media.play()//TODO add  iOS options
        }
    }
    //pauses the currently playing track (which can be resumed using play())
    pause=function(){
        if(player.hasTrack){
            player.isPlaying=false
            media.pause()
        }
    }
    // shuts down the media player
    stop=function(){
        player.hasTrack=false
        player.isPlaying=false
        player.title=undefined
        if(media){
            media.stop()
            media.release()
        }
        media=undefined
    }
    // initializes the media player with a src (url) and a title for the track
    setTrack=function(src, title){
        stop()
        player.hasTrack=true
        player.title=title
        media=new Media(src, function(){
            $timeout(function(){
                stop()
            },0,true)
        })
    }
    //scans to a particular location (between 0 and 1)
    scan=function(position){
        media.seekTo(media.getDuration()*position*1000)
        player.progress=position
    }

    player = {
        setTrack:setTrack,
        play:play,
        pause:pause,
        stop:stop,
        scan:scan,
        isPlaying:false,
        hasTrack:false,
        title:undefined,
        progress:0
    }
    $interval(function(){
        if(media){
            media.getCurrentPosition(function(pos){
                player.progress=pos/(1.0*media.getDuration())
            })
        }
    }, 300)

    return player
})
