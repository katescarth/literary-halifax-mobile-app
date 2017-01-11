angular.module('literaryHalifax')

/*
 *
 *
 */
.factory('cacheLayer', function($q, $http, lodash, $cordovaFileTransfer, $cordovaFile){
    
    
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
    
    var download = function(url, force){
        var filename = cordova.file.dataDirectory+'/'+url.split("/").pop();
        return $cordovaFileTransfer
            .download(url, filename)
            .then(function(success){
                return filename
            })

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
                        promises.push(
                            download(thing.file_urls[attribute])
                            .then(function(newUrl){
                                thing.file_urls[attribute] = newUrl
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
    
    return layer
})
