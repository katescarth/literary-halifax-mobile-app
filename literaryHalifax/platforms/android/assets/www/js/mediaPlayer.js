angular.module('literaryHalifax')

/*
 */
.factory('mediaPlayer', function($timeout, $interval){

    var player = undefined
    
    var media = undefined
    
    
    
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
        player.title=undefined
        if(media){
            media.stop()
            media.release()
        }
        media=undefined
    }
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
        title:undefined
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
