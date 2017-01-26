angular.module('literaryHalifax')

/*
 *
 *
 */
.factory('cacheLayer', function($q, $http, lodash, $ionicPlatform, $cordovaFileTransfer, $cordovaFile){
    
    // initialize the cache before handling any requests
    var initDeferred = $q.defer()
    var init = initDeferred.promise
    // cache for the results of GET requests
    // hash url->object
    var itemCache = {}
    
    // whether or not to automatically cache GET requests
    // TODO this should be a persistent setting
    var cacheIncoming = false
    
    // directory where we store all files
    var rootDir = ''
    // filename of the JSON dump of the item cache
    var itemCacheFile = ''
    
    $ionicPlatform.ready(function(){
        
        
        // If there are quotes around this, it's because I was debugging in
        // the browser. That will break caching
        rootDir = "cordova.file.dataDirectory"
        itemCacheFile = 'itemCache'
        
        if((ionic.Platform.isAndroid() || ionic.Platform.isIOS())){
            rootDir = cordova.file.dataDirectory
        }
        
        $cordovaFile.checkFile(rootDir, itemCacheFile)
        .then(function(success){
                return recoverItemCache().then(expandIndices)
            }, function(error){
            // no cache, that's fine
            return $q.when()
        }).then(function(){
            initDeferred.resolve()
        })
    })
    
    // remote locations of files and items
    var api = "http://206.167.183.207/api/"
    var files = "http://206.167.183.207/files/"
    
    $ionicPlatform.ready(function(){
            if(!(ionic.Platform.isAndroid() || ionic.Platform.isIOS())){
                // David's ionic serve address
                // Copy pasted from server.js
                // Gods of development forgive me
                api="http://192.168.2.14:8100/api/"
                files="http://192.168.2.14:8100/files/"
            }
        })
    
    // convert a url into a filename
    var hash = function(url){
        var urlParts = url.split("/")
        var tmp = urlParts.pop()
        return (urlParts.pop()+'-'+tmp)
    }
    
    // convert a filename into a url
    var unhash = function(filename){
        var parts = filename.split('-')
        var tmp = parts.pop()
        return files + parts.pop()+'/'+tmp
    }
    
    
    // performs a restricted deep search through the given object for
    // an object called 'file_urls'. When it finds it, it replaces any
    // urls inside it with the cached version of those files.
    
    // the search descends into
    // * data fields for http results (things with status texts)
    // * elements of an array
    // * a "file_urls" property
    var decorate = function(r){
        // create a closure so that we can decorate everything in parallel
        return (function(raw){
            var promises = []
            if(raw.statusText=="OK"){
                // raw is the response to a GET, decorate the data
                promises = [decorate(raw.data)]
            } else if(raw.constructor === Array){
                // raw is a list, decorate each item
                lodash.forEach(raw, function(item){
                    promises.push(decorate(item))
                })
            } else if (raw.file_urls) {
                // we've found the files. Check for cached versions
                for(attr in raw.file_urls){
                    (function(attribute){
                        if(raw.file_urls[attribute]){
                            var newUrl = hash(raw.file_urls[attribute])
                            promises.push(
                                // check if the file is cached
                                $cordovaFile.checkFile(rootDir, newUrl)
                                .then(function(){
                                    // if it is cached, replace the url
                                    raw.file_urls[attribute]=rootDir+'/'+newUrl
                                    return rootDir+'/'+newUrl
                                }).catch(function(){
                                    // otherwise, use the real url
                                    // TODO: if we implement airplane mode, replace it with
                                    // a placeholder image instead
                                    return raw.file_urls[attribute]
                                })
                            )
                        }


                    })(attr)
                }
            }
            return $q.all(promises).then(function(){
                return raw
            })
        })(r)
    }
    
    // Expose functionality by adding it to this object
    var layer = {}

    layer.cachingEnabled = function(){
        return !lodash.isEmpty(itemCache)
    }
    
    // access point for http requests. If the request is cached, resolve to the cached result,
    // otherwise make the request and resolve to that result
    layer.request = function(url){
        // always avoid making a request if possible. Nothing needs to
        // be refreshed in this app
        return init.then(function(){
            var promise
        
            if(itemCache&&itemCache[url]){
                promise = $q.when(itemCache[url])
            } else {
                promise = $http.get(url)
                            .then(function(result){
                                return result.data
                            }, function(error){
                                console.log(error)
                                return $q.reject('Couldn\'t complete the request')
                            })
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
        })
    }
    
    // download the given resource and cache it
    layer.cacheUrl =function(u,f){
        // closure for concurrence
        return (function(url, force){
            if(!url){
                console.log('tried to cache a non-existent url')
                return $q.when(url)
            }
            if(!force && isCachedUrl(url)){
                return $q.when(url)
            }
            var filename = rootDir+"/"+hash(url)
            return $cordovaFileTransfer
                .download(url, filename)
                .then(function(success){
                    return filename
                })
        })(u,f)
    }
    
    // uncache the given path
    layer.clearUrl = function(path){
        if(!path){
            console.log("attempted to clear a null path")
            return $q.when(path)
        }
        
        var filename = path.split("/").pop()
        var url = unhash(filename)
        return $cordovaFile.checkFile(rootDir,filename)
        .then(function(){
            return $cordovaFile.removeFile(rootDir,filename)
        }, function(error){
            //the file already does not exist
            return $q.when()
        }).then(function(success){
            // for convenience, resolve with the url that
            // the cached file came from
            return url
        })
    }

    // checks if a url refers to a cached file.
    // note - this does not check if the file actually exists
    // if the url is falsy, return true (null is cached because we don't)
    // need to make a request to use it
    var isCachedUrl = function(url){
        return !url || url.startsWith(rootDir)
    }
    
    // determines whether all files associated with the landmark are cached
    // this must be done quickly, so it is imperfect (we can't actually look for the files)
    layer.landmarkIsCached = function(landmark){
        if(!isCachedUrl(landmark.audio)){
            return false
        }
        for(var i=0;i<landmark.images.length;i++){
            if (!(
                isCachedUrl(landmark.images[i].full) &&
                isCachedUrl(landmark.images[i].squareThumb) &&
                isCachedUrl(landmark.images[i].thumb)
            )){
                return false
            }
        }
        return true
    }
    
    // download and cache one item type
    // such as "geolocations", "items", or "tours"
    var downloadAndCache = function(itemType){
        var url = api+itemType
        return $http.get(url)
            .then(function(result){
                itemCache[url] = result.data                
        })
    }
    
    
    // Dump the item cache to a file
    // Only the results of index requests are needed
    // to recreate the entire cache
    
    // This will still work if results from individual requests
    // are storerd in the item cache, but it's a waste of space.
    var saveItemCache = function(){
        var data = JSON.stringify(itemCache)
        return $cordovaFile.writeFile(rootDir,itemCacheFile,data,true)
    }
    
    // Read index results out of the file and store them in the item cache.
    var recoverItemCache = function(){
        return $cordovaFile.readAsText(rootDir,itemCacheFile)
            .then(function(result){
                itemCache=JSON.parse(result)
            })
    }
    
    // delete the item cache
    var destroyItemCache = function(){
        return $cordovaFile.removeFile(rootDir,itemCacheFile)
            .then(function(success){
                itemCache = {}
            })
    }
    
    // delete every cached file, then delete the item cache
    layer.destroyCache = function(){
        var filesIndex = itemCache[api+'files']

        // decorate the file cache so that remote urls aare replaced with their cached versions.
        // Normally modifying the cache like this is bad, but
        // it's going to be deleted anyway
        return decorate(filesIndex)
        .then(function(){
            var promises = []
            lodash.each(filesIndex,function(file){
                for(attr in file.file_urls){
                    if(file.file_urls[attr]&&isCachedUrl(file.file_urls[attr])){
                        promises.push(
                            layer.clearUrl(file.file_urls[attr])
                        )
                    }
                }
            })

            return $q.all(promises).then(destroyItemCache)
        })
    }
    
    // This is a bit out of place. We retrieve files from the
    // server using api/files?item={id}. Rather than making
    // and caching that request, if we have the file index
    // cached, we look through it for files associated with 
    // the correct item.
    layer.filesForItem = function(itemID){
        var promise 
        if(itemCache && itemCache[api+'files']){
            var filesIndex = itemCache[api+'files']
            var filteredFiles = lodash.cloneDeep(
                lodash.filter(filesIndex,
                    function(file){
                        return file.item.id==itemID
                    }
                )
            )
            promise = $q.when(filteredFiles)
        } else {
            promise = $http.get(api+'files?item='+itemID)
                    .then(function(result){
                        return result.data
                    }, function(error){
                        return $q.reject('Couldn\'t complete the request')
                    })
        }
        return promise.then(decorate)
    }
    
    // copy the contents of a cached index request
    // into their own cache entries
    var expandIndex = function(itemType){
        var index = itemCache[api+itemType]
        for(var i=0;i<index.length;i++){
            itemCache[index[i].url] = index[i]
        }
        
    }
    
    var expandIndices = function(){
        expandIndex('items')
        expandIndex('tours')
        expandIndex('files')
        expandIndex('simple_pages')
        expandIndex('geolocations')            
    }
    
    layer.cacheMetadata = function(){
        return $q.all(
            [
                downloadAndCache('items'),
                downloadAndCache('tours'),
                downloadAndCache('files'),
                downloadAndCache('simple_pages'),
                downloadAndCache('geolocations')
            ]
        ).then(saveItemCache)
        .then(expandIndices)
    }
    
    
    return layer
})
