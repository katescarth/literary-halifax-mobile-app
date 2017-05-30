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
            // whether or not to automatically cache GET requests
            // TODO this should be a persistent setting
            cacheIncoming = false,
            // directory where we store all files
            rootDir = '',
            // filename of the JSON dump of the item cache
            itemCacheFile = '',
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


        // The following two functions perform a mapping from urls on the server to valid local filenames
        // a one-to-one mapping failed for some reason, so this only works for files that follow the format
        // serverAddress/files/word/word.extension
    
        // if caching audio for directions is broken, this is probably why.
    
        // convert a url into a filename
        function hash(url) {
            var urlParts = url.split("/"),
                tmp = urlParts.pop(),
                result = urlParts.pop() + '-' + tmp;
            return result;
        }

        // convert a filename into a url
        function unhash(filename) {
            var parts = filename.split('-'),
                tmp = parts.pop(),
                result = files + parts.pop() + '/' + tmp;
            return result;
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
                        var newUrl = hash(value);
                        // if rootDir is undefined, there is no possibility of a cached file
                        if (rootDir) {
                            promises.push(
                                // check if the file is cached
                                $cordovaFile.checkFile(rootDir, newUrl)
                                    .then(function () {
                                        // if it is cached, replace the url
                                        raw.file_urls[key] = rootDir + '/' + newUrl;
                                        return rootDir + '/' + newUrl;
                                    }).catch(function () {
                                        // otherwise, use the real url
                                        // TODO: if we implement airplane mode, replace it with
                                        // a placeholder image instead
                                        return value;
                                    })
                            );
                        }
                    }
                });
                
            } else if(raw.directions_url) {
                var newUrl = hash(raw.directions_url);
                        // if rootDir is undefined, there is no possibility of a cached file
                        if (rootDir) {
                            promises.push(
                                // check if the file is cached
                                $cordovaFile.checkFile(rootDir, newUrl)
                                    .then(function () {
                                        // if it is cached, replace the url
                                        raw.directions_url = rootDir + '/' + newUrl;
                                        return rootDir + '/' + newUrl;
                                    }).catch(function () {
                                        // otherwise, use the real url
                                        return raw.directions_url;
                                    })
                            );
                        }
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
            return !url || url.startsWith(rootDir);
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

        // delete the item cache
        function destroyItemCache() {
            return $cordovaFile.removeFile(rootDir, itemCacheFile)
                .then(function (success) {
                    itemCache = {};
                    status.cacheEnabled = false;
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
                            return $q.reject(localization.strings.errorMessageGenericRequest);
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
                $log.info("saved file " + filename);
                    return filename;
                });
        };

        // uncache the given path
        layer.clearUrl = function (path) {
            if (!path) {
                $log.warn("Tried to clear a null path");
                return $q.when(path);
            }

            var filename = path.split("/").pop(),
                url = unhash(filename);
            return $cordovaFile.checkFile(rootDir, filename)
                .then(function () {
                    return $cordovaFile.removeFile(rootDir, filename);
                }, function (error) {
                    //the file already does not exist
                    return $q.when();
                }).then(function (success) {
                    // for convenience, resolve with the url that
                    // the cached file came from
                    return url;
                });
        };


        // determines whether all files associated with the landmark are cached
        // this must be done quickly, so it is imperfect (we can't actually look for the files)
        layer.landmarkIsCached = function (landmark) {
            if (landmark.audio && !isCachedUrl(landmark.audio.url)){
                return false;
            }
            return lodash.every(landmark.images, function (imageObj) {
                return isCachedUrl(imageObj.full) &&
                    isCachedUrl(imageObj.squareThumb) &&
                    isCachedUrl(imageObj.thumb);
            });
        };

        // delete every cached file, then delete the item cache
        layer.destroyCache = function () {
            var filesIndex = itemCache[layer.getRequest('files').url];
            status.working = true;
            // decorate the file cache so that remote urls are replaced with their cached versions.
            // Normally modifying the cache like this is bad, but
            // it's going to be deleted anyway
            return decorate(filesIndex)
                .then(function () {
                    var promises = [];
                    lodash.each(filesIndex, function (file) {
                        
                        lodash.forOwn(file.file_urls, function (value, key) {
                            if (value && isCachedUrl(value)) {
                                promises.push(layer.clearUrl(value));
                            }
                        });
                    });

                    return $q.all(promises).then(destroyItemCache);
                }).finally(function () {
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

            if (typeof cordova !== 'undefined') {
                rootDir = cordova.file.dataDirectory;
            } else {
                // localhost ip for ionic serve
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
                    return recoverItemCache().then(expandIndices);
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