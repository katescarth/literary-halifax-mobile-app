var MEDIA_NONE = 0,
    MEDIA_STARTING = 1,
    MEDIA_RUNNING = 2,
    MEDIA_PAUSED = 3,
    MEDIA_STOPPED = 4;

/*global angular */
/*global ionic */
angular.module('literaryHalifax')

    /*
     * A single media player which handles one track at a time throughout the app
     *
     * the player exposes the variables isPlaying, hasTrack, progress, and title for fast binding
     *
     */
    .factory('mediaPlayer', function ($timeout, $interval, audioPlayer, $ionicPlatform, $log, $q) {
        "use strict";
        var player,
            media,
            track;

        function statusManager(statusObj) {
            $log.info("status change: " + angular.toJson(statusObj));
            if (statusObj.status === MEDIA_RUNNING) {
                player.isPlaying = true;
                player.hasTrack = true;

            } else if (statusObj.status === MEDIA_PAUSED) {
                player.isPlaying = false;
                player.hasTrack = true;

            } else if (statusObj.status === MEDIA_STOPPED) {
                player.isPlaying = false;
                player.hasTrack = false;
                if (media) {
                    player.title = undefined;
                    media.release();
                    media = undefined;
                }
            } 
        }

        //plays the currently selected track
        function play() {
            var promise;
            if (media) {
                if (ionic.Platform.isIOS()) {
                    promise = media.play({
                        numberOfLoops: 1,
                        playAudioWhenScreenIsLocked : true
                    });
                } else {
                    promise = media.play();
                }
                promise.then(null, null, statusManager);
            }
        }
        //pauses the currently playing track (which can be resumed using play())
        function pause() {
            if (media) {
                media.pause();
            }
        }
        // shuts down the media player
        function stop() {
            if (media) {
                media.stop();
            }
        }

        // initializes the media player with a src (url) and a title for the track
        function setTrack(src, title) {
            stop();
            player.title = title;
            track = src;
            player.hasTrack = true;
            media = audioPlayer.newMedia(src);
        }
        //scans to a particular location (between 0 and 1)
        function scan(position) {
            if (position === 0) {
                if (player.isPlaying) {
                    setTrack(track, player.title);
                    // need to timeout so that the play status registers after the pause/stop
                    $timeout(play);
                } else {
                    setTrack(track, player.title);
                }
            } else {
                if (media) {
                    media.getDuration().then(function (duration) {
                        media.seekTo(duration * position * 1000);
                    });
                }
            }
            player.progress = position;
        }

        player = {
            setTrack : setTrack,
            play : play,
            pause : pause,
            stop : stop,
            scan : scan,
            isPlaying : false,
            hasTrack : false,
            title : undefined,
            progress : 0
        };

        // keep the progress variable updated
        $interval(function () {
            if (media) {
                $q.all([
                    media.getDuration(),
                    media.currentTime()
                ]).then(function (result) {
                    player.progress = result[1] / result[0];
                }, function (error) {
                    $log.info(angular.toJson(error));
                });
            }
        }, 300);

        return player;
    });