/*global angular */
/*global cordova */
/*global ionic */
angular.module('literaryHalifax')
/*
 *
 *
 */
    .factory('cacheLayer', function ($q, $http, lodash, $ionicPlatform, $cordovaFileTransfer, $cordovaFile, $cordovaNetwork, $ionicPopup, $log, utils, localization) {
        "use strict";
        // when this promise resolves, the cache layer is ready to handle requests
        var initDeferred = $q.defer(),
            init = initDeferred.promise,
            // cache for the results of GET requests
            // hash url->object
            itemCache = {},
            // cache which stores fi;enames of images, audio, etc.
            fileCache = {},
            // whether or not to automatically cache GET requests
            // TODO this should be a persistent setting
            cacheIncoming = false,
            // directory where we store all files
            rootDir = '',
            // filename of the JSON dump of the item cache
            itemCacheFile = '',
            // filename of the JSON dump of the file cache
            fileCacheFile = '',
            // remote locations of files and items
            api = localization.resources.serverAddress + "api/",
            files = localization.resources.serverAddress + "files/",
            status = {
                // is the cache currently working on something
                working: false,
                // is the cache currently functioning
                cacheEnabled: false
            },
            // Expose functionality by adding it to this object
            layer = {
                status: status
            };


        // convert a url into a filename
        function hash(url) {
            var urlParts = url.split("/"),
                tmp = urlParts.pop();
            return (urlParts.pop() + '-' + tmp);
        }

        // convert a filename into a url
        function unhash(filename) {
            var parts = filename.split('-'),
                tmp = parts.pop();
            return files + parts.pop() + '/' + tmp;
        }
    
        function applyParams(records, params) {
            var point,
                getDistance = function (record) {
                    var location;
                    if (record.start) {
                        location = {
                            lat: record.start.lat,
                            lng: record.start.lng
                        };
                    } else {
                        location = {
                            lat: itemCache[record.extended_resources_mirror.geolocations.url].latitude,
                            lng: itemCache[record.extended_resources_mirror.geolocations.url].longitude
                        };
                    }
                    return utils.distance(point, location);
                },
                result = records;
            if (params.near) {
                point = {
                    lat: params.near.lat,
                    lng: params.near.lng
                };
                result = lodash.sortBy(result, getDistance);
            }
            if (params.page) {
                params.per_page = params.per_page || 20;
                result = lodash.slice(result,
                                      (params.page - 1) * params.per_page,
                                      (params.page) * params.per_page
                                     );
            }
            return result;
        }


        // performs a restricted deep search through the given object for
        // an object called 'file_urls'. When it finds it, it replaces any
        // urls inside it with the cached version of those files.

        // the search descends into
        // * data fields for http results (things with status texts)
        // * elements of an array
        // * a "file_urls" property
        function decorate(raw) {
            var promises = [];
            if (!raw) {
                //no op
                promises = [$q.when()];
            } else if (raw.statusText === "OK") {
                // raw is the response to a GET, decorate the data
                promises = [decorate(raw.data)];
            } else if (raw.constructor === Array) {
                // raw is a list, decorate each item
                promises = lodash.map(raw, decorate);
            } else if (raw.items) {
                $log.info(angular.toJson(raw.items));
                promises = [decorate(raw.items)];
            } else if (raw.file_urls) {
                // we've found the files. Check for cached versions
                lodash.forOwn(raw.file_urls, function (value, key) {
                    if (value) {
                        raw.file_urls[key] = fileCache[value] || raw.file_urls[key];
                    }
                });
                promises = [$q.when()];
                
            } else if(raw.directions_url) {
                raw.directions_url = fileCache[raw.directions_url] || raw.directions_url;
                promises = [$q.when()];
            }
            return $q.all(promises).then(function () {
                return raw;
            });
        }
    
        function getRequest(resourceName) {
            var result = {
                url: api + resourceName,
                params: {},
                setId: function (id) {
                    result.url = result.url + '/' + id;
                    return result;
                },
                addParam : function (param, value) {
                    result.params[param] = value;
                    return result;
                }
            };
            return result;
        }
    
    
        function getAllPages(itemType) {
            var result,
                addPage = function (page) {
                    return layer.request(getRequest(itemType).addParam('page', page))
                        .then(function (success) {
                            if (success.length) {
                                if (result) {
                                    result = result.concat(success);
                                } else {
                                    result = success;
                                }
                                return addPage(page + 1);
                            }
                            return result;
                        });
                };
            return addPage(1);
        }

        // checks if a url refers to a cached file.
        // note - this does not check if the file actually exists
        // if the url is falsy, return true (null is cached because we don't
        // need to make a request to use it)
        function isCachedUrl(url) {
            return !url || url.startsWith(rootDir) || fileCache[url];
        }
    
        // Dump the item cache to a file
        // Only the results of index requests are needed
        // to recreate the entire cache
        //
        // This will still work if results from individual requests
        // are stored in the item cache, but it's a waste of space.
        function saveItemCache() {
            var data = angular.toJson(itemCache);
            status.cacheEnabled = true;
            return $cordovaFile.writeFile(rootDir, itemCacheFile, data, true);
        }

        // Read index results out of the file and store them in the item cache.
        function recoverItemCache() {
            return $cordovaFile.readAsText(rootDir, itemCacheFile)
                .then(function (result) {
                    status.cacheEnabled = true;
                    itemCache = angular.fromJson(result);
                });
        }

        function recoverFileCache() {
            return $cordovaFile.readAsText(rootDir, fileCacheFile)
                .then(function (result) {
                    fileCache = angular.fromJson(result);
                });
        }
    
        function saveFileCache() {
            return $cordovaFile.writeFile(rootDir, fileCacheFile, angular.toJson(fileCache), true);
        }

        // delete the item cache
        function destroyItemCache() {
            return $cordovaFile.removeFile(rootDir, itemCacheFile)
                .then(function (success) {
                    itemCache = {};
                    status.cacheEnabled = false;
                });
        }

        // delete the file cache
        function destroyFileCache() {
            return $cordovaFile.removeFile(rootDir, fileCacheFile).then(function () {
                fileCache = {};
            });
        }
    
        // download and cache one item type
        // such as "geolocations", "landmarks", or "tours"
        function downloadAndCache(itemType) {
            return getAllPages(itemType)
                .then(function (result) {
                    itemCache[getRequest(itemType).url] = result;
                }, function (error) {
                    $log.error("Error caching index of " + itemType + ": " + angular.toJson(error));
                });
        }
    
        // copy the contents of a cached index request
        // into their own cache entries
        function expandIndex(itemType) {
            var index = itemCache[getRequest(itemType).url];
            lodash.times(index.length, function (i) {
                itemCache[index[i].url] = index[i];
            });
        }

        function expandIndices() {
            expandIndex('landmarks');
            expandIndex('tours');
            expandIndex('files');
            expandIndex('simple_pages');
            expandIndex('geolocations');
        }

        // access point for http requests. If the request is cached, resolve to the cached result,
        // otherwise make the request and resolve to that result
        function request(req) {
            $log.info("making a request: " + angular.toJson(req));
            // always avoid making a request if possible. Nothing needs to
            // be refreshed in this app
            return init.then(function () {
                var promise,
                    url = req.url,
                    params = req.params;

                if (itemCache && itemCache[url]) {
                    promise = $q.when(applyParams(itemCache[url], params));
                } else {
                    promise = $http.get(url, {params: params})
                        .then(function (result) {
                            if (!result.data) {
                                $log.warn("Http request to " + url + "returned no data");
                            }
                            return result.data;
                        }, function (error) {
                            $log.error("http request to " + url + " failed: " + angular.toJson(error));
                            return $q.reject('Couldn\'t complete the request');
                        });
                }

                return promise.then(decorate);
            });
        }
    
        layer.getAll = function (itemType) {
            return getAllPages(itemType).then(decorate);
        };
    
        layer.getRequest = getRequest;
    
        layer.request = request;
    
        layer.isCachedUrl = isCachedUrl;

        // download the given resource and cache it
        layer.cacheUrl = function (url) {
            if (!rootDir) {
                return $q.reject("cordova file plugin unavailable.");
            }
            if (!url) {
                $log.warn('Tried to cache a null url');
                return $q.when(url);
            }
            if (isCachedUrl(url)) {
                return $q.when(url);
            }
            var filename = rootDir + "/" + hash(url);
            return $cordovaFileTransfer
                .download(url, filename)
                .then(function (success) {
                    // try to write this change to the file, but if we fail there's not a lot we can do
                    saveFileCache().catch(function (error) {
                        $log.error("could not save file cache: " + error);
                    });
                    fileCache[url] = filename;
                    return filename;
                });
        };

        // uncache the given path
        layer.clearUrl = function (path) {
            
            var originalUrl = lodash.findKey(fileCache, function (fileName) {
                return fileName == path;
            }),
                filename = path.split('/').pop();
            
            return $cordovaFile.checkFile(rootDir, filename)
                .then(function () {
                    return $cordovaFile.removeFile(rootDir, filename);
                }, function (error) {
                    //the file already does not exist
                    return $q.when();
                }).then(function (success) {
                    fileCache[originalUrl] = undefined;
                    // try to write this change to the file, but if we fail there's not a lot we can do
                    saveFileCache().catch(function (error) {
                        $log.error("could not save file cache: " + error);
                    });
                
                    // for convenience, resolve with the url that
                    // the cached file came from
                    return originalUrl;
                });
        };


        // determines whether all files associated with the landmark are cached
        // this must be done quickly, so it is imperfect (we can't actually look for the files)
        layer.landmarkIsCached = function (landmark) {
            return isCachedUrl(landmark.audio) &&
                lodash.every(landmark.images, function (imageObj) {
                    return isCachedUrl(imageObj.full) &&
                        isCachedUrl(imageObj.squareThumb) &&
                        isCachedUrl(imageObj.thumb);
                });
        };

        // delete every cached file, then delete the item cache
        layer.destroyCache = function () {
            var filesIndex = itemCache[layer.getRequest('files').url],
                promises = [];
            status.working = true;
                
            // decorate the file cache so that remote urls are replaced with their cached versions.
            // Normally modifying the cache like this is bad, but
            // it's going to be deleted anyway
            
            lodash.each(fileCache, function (cachedUrl) {
                promises.push(layer.clearUrl(cachedUrl));
            })
            return $q.all(promises).then(
                $q.all([
                    destroyItemCache(),
                    destroyFileCache()
                ]
                )).finally(function () {
                status.working = false;
            });
        };

        // This is a bit out of place. We retrieve files from the
        // server using api/files?item={id}. Rather than making
        // and caching that request, if we have the file index
        // cached, we look through it for files associated with 
        // the correct item.
        layer.filesForItem = function (itemID) {
            var promise,
                filesIndex,
                filteredFiles,
                req = layer.getRequest('files').addParam('item', itemID);
            if (itemCache && itemCache[req.url]) {
                filesIndex = itemCache[req.url];
                filteredFiles = lodash.cloneDeep(
                    lodash.filter(filesIndex,
                        function (file) {
                            return file.item.id === itemID;
                        })
                );
                promise = $q.when(filteredFiles);
            } else {
                promise = layer.request(req)
                    .then(function (result) {
                        return result;
                    }, function (error) {
                        return $q.reject(localization.strings.errorMessageGenericRequest);
                    });
            }
            return promise.then(decorate);
        };


        layer.cacheMetadata = function () {
            if (!rootDir) {
                $log.error("caching is disabled because either cordova or cordova.file is unavailable");
                return $q.reject();
            }
            status.working = true;
            return $q.all(
                [
                    downloadAndCache('landmarks'),
                    downloadAndCache('tours'),
                    downloadAndCache('files'),
                    downloadAndCache('simple_pages'),
                    downloadAndCache('geolocations')
                ]
            ).then(saveItemCache).then(expandIndices)
                .finally(function () {
                    status.working = false;
                });
        };
    
        layer.status = status;

        $ionicPlatform.ready(function () {
            rootDir = "cordova.file.dataDirectory";
            itemCacheFile = 'itemCache';
            fileCacheFile = 'fileCache'

            if (typeof cordova !== 'undefined') {
                rootDir = cordova.file.dataDirectory;
            } else {
                api = "http://134.190.179.115:8100/api/";
                files = "http://134.190.179.115:8100/files/";
                rootDir = undefined;
                $log.error("Cordova is not defined. Are you on a mobile device?");
            }
            
            //we are in ionic view, so there is cordova but no cordova file            
            if (!rootDir) {
                initDeferred.resolve();
                status.working = false;
                return;
            }
            
            $cordovaFile.checkFile(rootDir, itemCacheFile)
                .then(function (success) {
                    return recoverItemCache().then(expandIndices).then(recoverFileCache);
                }, function (error) {
                    // no cache, that's fine
                    return $q.when();
                })
                .then(function () {
                    if (navigator.connection && !($cordovaNetwork.isOnline() || status.cacheEnabled)) {
                        $ionicPopup.alert({
                            title : 'No connection',
                            template : 'Until you connect to the internet, no content will be available.',
                            okType : 'button-app-colour'
                        }).finally(function () {
                            initDeferred.resolve();
                        });
                    } else {
                        initDeferred.resolve();
                    }
                });
        });

        return layer;
    });
