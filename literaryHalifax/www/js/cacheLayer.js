angular.module('literaryHalifax')

/*
 *
 *
 */
.factory('cacheLayer', function($q, $http, lodash, $ionicPlatform, $cordovaFileTransfer, $cordovaFile){
    
    
    
    
    // cache for the results of GET requests
    // hash url->object
    var itemCache = {}
    
    // whether or not to automatically cache GET requests
    // TODO this should be a persistent setting
    var cacheIncoming = false
    
    // cache for images and audio files
    // hash url->url
    // Question: urls are unique, so we don't need a complicated hash. Why not
    // 
    var fileCache = {}
    
    
    var rootDir = ''
    
    $ionicPlatform.ready(function(){
        rootDir = cordova.file.dataDirectory
    })
    
    // convert a url into a file name. That file name will
    // correspond to 
    var hash = function(url){
        var urlParts = url.split("/")
        var tmp = urlParts.pop()
        return (urlParts.pop()+'-'+tmp)
    }
    
    
    // performs a restricted deep search through the given object for
    // an object called 'file_urls'. When it finds it, it replaces any
    // urls inside it with the cached version of those files.
    var decorate = function(decorable){
        
        
        // create a closure so that we can decorate everything in parallel
        return (function(thing){
            var promises = []
            if(thing.statusText=="OK"){
                // thing is the response to a GET, decorate the data
                promises = [decorate(thing.data)]
            } else if(thing.constructor === Array){
                // thing is a list, decorate each item
                lodash.forEach(thing, function(item){
                    promises.push(decorate(item))
                })
            } else if (thing.file_urls) {
                // we've found the files. Check for cached versions
                for(attr in thing.file_urls){
                    (function(attribute){
                        var newUrl = hash(thing.file_urls[attribute])
                        promises.push(
                            // check if the file is cached
                            $cordovaFile.checkFile(rootDir, newUrl)
                            .then(function(){
                                // if it is cached, replace the url
                                thing.file_urls[attribute]=rootDir+'/'+newUrl
                                return rootDir+'/'+newUrl
                            }).catch(function(){
                                // otherwise, use the real url
                                // TODO: if we implement airplane mode, replace it with
                                // a placeholder image instead
                                return thing.file_urls[attribute]
                            })
                        )


                    })(attr)
                }
            }
            return $q.all(promises).then(function(){
                return thing
            })
        })(decorable)
    }
    
    var layer = {}
    
    layer.files = fileCache

    layer.request = function(url){
        var promise
        // always avoid making a request if possible. Nothing needs to
        // be refreshed in this app.
        if(itemCache[url]){
            promise = $q.when(itemCache[url])
        } else {
            promise = $http.get(url)
            if(cacheIncoming){
                promise = promise.then(
                    function(result){
                        itemCache[url] = result
                        return result
                    }
                )
            }
        }
        
        return promise.then(decorate)
    }
    
    layer.cacheUrl =function(u,f){
        // closure for concurrence
        return (function(url, force){
            if(!force && isCachedUrl(url)){
                return $q.when(url)
            }
            var filename = rootDir+"/"+hash(url)
            return $cordovaFileTransfer
                .download(url, filename)
                .then(function(success){
                    fileCache[url]=filename
                    return filename
                })
        })(u,f)
    }
    
    layer.clearUrl = function(url){
        var filename = hash(url)
        return $cordovaFile.checkFile(rootDir,fileName)
        .then(function(){
            return $cordovaFile.removeFile(rootDir,fileName)
        }).then(function(success){
            delete fileCache[url]
        })
    }
    
    var isCachedUrl = function(url){
        return url.startsWith(rootDir)
    }
    
    // determines whether all files associated with the landmark are cached
    // this must be done quickly, so it is imperfect (we can't actually look for the files)
    layer.landmarkIsCached = function(landmark){
        for(var i=0;i<landmark.images.length;i++){
            if (!(
                isCachedUrl(landmark.images[i].full) &&
                isCachedUrl(landmark.images[i].squareThumb) &&
                isCachedUrl(landmark.images[i].thumb)
            )){
                return false
            }
        }
        // TODO audio
        return true
    }
    
    
    return layer
})