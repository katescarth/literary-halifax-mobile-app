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
    var fileCache = {}
    
    var rootDir = ''
    var itemCacheFile = ''
    
    $ionicPlatform.ready(function(){
        rootDir = cordova.file.dataDirectory
        itemCacheFile = 'itemCache'
        $cordovaFile.checkFile(rootDir, itemCacheFile)
        .then(function(success){
                recoverItemCache()
            }, function(error){
            // no cache, that's fine
        })
    })
    
    
    var api = "http://206.167.183.207/api/"
    var files = "http://206.167.183.207/files/"
    
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
    
    // I should have commented on this when I added it but now I don't know what it's for
    layer.files = fileCache

    // access point for http requests. If the request is cached, return the cached result,
    // otherwise make the request
    layer.request = function(url){
        var promise
        // always avoid making a request if possible. Nothing needs to
        // be refreshed in this app.
        if(itemCache&&itemCache[url]){
            promise = $q.when(itemCache[url])
        } else {
            promise = $http.get(url)
                        .then(function(result){
                            return result.data
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
    }
    
    // download the given resource and cache it
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
    
    // uncache the given url
    // Note - this has to be the original, remote url
    // the cached url won't work
    layer.clearUrl = function(path){
        var filename = path.split("/").pop()
        var url = unhash(filename)        
        return $cordovaFile.checkFile(rootDir,filename)
        .then(function(){
            return $cordovaFile.removeFile(rootDir,filename)
        }).then(function(success){
            delete fileCache[url]
            return url
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
    //DRY in server
    var downloadAndCache = function(itemType){
        var url = api+itemType
        return $http.get(url)
            .then(function(result){
                itemCache[url] = result.data
                
                for(var i=0;i<result.data.length;i++){
                    itemCache[result.data[i].url] = result.data[i]
                }
                
        })
    }
    
    
    // Dump the item cache to a file
    // Only the results of index requests are needed
    // to recreate the entire cache
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
    
    // Delete the item cache
    var destroyItemCache = function(){
        return $cordovaFile.removeFile(rootDir,itemCacheFile)
                .then(function(){
            itemCache=undefined
        })
    }
    
    //Delete the file cache and every file
    var destroyFileCache = function(){
        var promises = []
        for(attr in fileCache){
            (function(url){
                promises.push(
                    $cordovaFile.removeFile(rootDir,hash(url))
                    .then(function(){
                        delete fileCache[url]
                    })
                )
            })(attr)
        }
        
        return $q.all(promises).then(function(){
            fileCache = undefined
        })
        
    }
    
    layer.destroyCache = function(){
        return $q.all([
            destroyFileCache(),
            destroyItemCache()
        ])
    }
    
    // This is a bit out of place. We retrieve files from the
    // server using api/files?item={id}. Rather than making
    // and caching that request, if we have the file index
    // cached, we look through it for files associated with 
    // the correct item.
    layer.filesForItem = function(itemID){
        var promise 
        if(itemCache && itemCache[api+'files']){
            var files = itemCache[api+'files']
            var filteredFiles = lodash.cloneDeep(
                lodash.filter(files,
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
                    })
        }
        return promise.then(decorate)
    }
    
    // copy the contents of a cached index request
    // into their own cache entries
    var expandIndex = function(itemType){
        
        var index = itemCache[api+itemType]
        
        for(var i=0;i<result.data.length;i++){
            itemCache[result.data[i].url] = result.data[i]
        }
    }
    
    layer.cacheMetadata = function(){
        $q.all(
            [
                downloadAndCache('items'),
                downloadAndCache('tours'),
                downloadAndCache('files'),
                downloadAndCache('simple_pages'),
                downloadAndCache('geolocations')
            ]
        ).then(saveItemCache)
        .then(function(){
                expandIndex('items')
                expandIndex('tours')
                expandIndex('files')
                expandIndex('simple_pages')
                expandIndex('geolocations')            
        })
    }
    
    
    return layer
})
