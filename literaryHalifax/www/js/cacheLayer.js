angular.module('literaryHalifax')

/*
 *
 *
 */
.factory('cacheLayer', function($q,$http,lodash){
    
    // cache for the results of GET requests
    // hash url->object
    var itemCache = {}
    
    // whether or not to automatically cache GET requests
    // TODO this should be a persistent setting
    var cacheIncoming = false
    
    // cache for images and audio files
    // hash url->url
    var fileCache = {}
    
    
    // 
    var decorate = function(thing){
        if(thing.statusText="OK"){
            return decorate(thing.data)
        } else if(thing.constructor === Array){
            var promises = lodash.map(thing, function(item){
                return decorate(item)
            })
            return $q.all(promises)
        } else if (thing.file_urls) {
            for(attr in thing){
                if(fileCache[thing[attr]]){
                    thing[attr] = fileCache[thing[attr]]
                }
            }
        }
        return $q.when()
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
