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
    var track = undefined
    
    statusManager=function(status){
        if(status==Media.MEDIA_RUNNING){
            player.isPlaying=true
            player.hasTrack=true
            
        } else if(status==Media.MEDIA_PAUSED){
            player.isPlaying=false
            player.hasTrack=true
            
        } else if(status==Media.MEDIA_STOPPED){
            player.isPlaying=false
            player.hasTrack=false            
        } 
    }
    
    
    //plays the currently selected track
    play=function(){
        player.isPlaying = true
        if(media){   
            media.play()//TODO add  iOS options
        }
    }
    //pauses the currently playing track (which can be resumed using play())
    pause=function(){
        player.isPlaying = true
        if(media){
            media.pause()
        }
    }
    // shuts down the media player
    stop=function(){
        player.title=undefined
        player.hasTrack=false
        player.isPlaying=false
        if(media){
            media.stop()
            media.release()
        }
        media=undefined
    }
    
    // initializes the media player with a src (url) and a title for the track
    setTrack=function(src, title){
        stop()
        player.title=title
        track=src
        player.hasTrack=true
//        media=new Media(src, function(){},function(){},statusManager)
    }
    //scans to a particular location (between 0 and 1)
    scan=function(position){
        if(position==0){
            if(player.isPlaying){
                player.setTrack(track,player.title)
                player.play()
            } else {
                player.setTrack(track,player.title)
            }
        } else {
            if(media){
                media.seekTo(media.getDuration()*position*1000)
            }
        }
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
    
    // keep the progress variable updated
    $interval(function(){
        if(media){
            media.getCurrentPosition(function(pos){
                player.progress=pos/(1.0*media.getDuration())
            })
        }
    }, 300)

    return player
})
