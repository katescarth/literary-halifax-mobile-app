/*global angular */
/*global cordova */
/*global ionic */
angular.module('literaryHalifax')
    .factory('mapCache', function ($log, $cordovaFileTransfer, $cordovaFile, $cordovaNetwork, $ionicPlatform, $q, lodash, server) {

        "use strict";
            // If true, do not display any tiles which aren't in the cache
        var strictMode = false,
            // Name of the file which stores the JSON dump of the cache
            filename = "mapCache",
            // Directory where all files are stored
            rootDir,
            // fileType of map tiles
            terminator = '.png',
            // resolves once the cache has been initialized
            initDeferred = $q.defer(),
            init = initDeferred.promise,
            // table of the filenames of cached files. hash(x,y,zoom) -> fileName
            cache = {},
            // 
            status = {
                working: false,
                cacheEnabled: false
            };
    
        // write the cache to the file for later recovery
        function writeCache() {
            return $cordovaFile.writeFile(rootDir,
                                   filename,
                                   angular.toJson(cache),
                                   true);
            
        }
        // recover the cache from the file
        function readCache() {
            return $cordovaFile.readAsText(rootDir, filename)
                .then(function (result) {
                    cache = angular.fromJson(result);
                    status.cacheEnabled = true;
                });
        }
    
        function deleteCache() {
            
            var promises = [];
            status.working = true;
            lodash.forOwn(cache, function (key, value) {
                promises.push(
                    $cordovaFile.removeFile(rootDir, value)
                        .then(function () {
                            delete cache[key];
                        })
                );
            });
            return $q.all(promises).then(function () {
                cache = {};
                status.cacheEnabled = false;
                return $cordovaFile.removeFile(rootDir, filename);
            }).finally(function () {
                status.working = false;
            });
            
        }
    
        $ionicPlatform.ready(function () {
            if (typeof cordova !== 'undefined') {
                rootDir = cordova.file.dataDirectory;
            } else {
                $log.error("Cordova is not defined. Are you on a mobile device?");
            }
            status.working = true;
            // recover the cache if it exists
            $cordovaFile.checkFile(rootDir, filename)
                // if the file doesn't exist, just resolve
                .then(readCache)
                .finally(function () {
                    initDeferred.resolve();
                    status.working = false;
                });
        });
    
        // create an unambiguous string reference to a tile
        function hash(x, y, zoom) {
            return zoom + '-' + x + '-' + y + terminator;
        }
    
        // download a tile, save it to a file, and add it to the cache object
        function cacheTile(x, y, zoom) {
            var subdomain,
                url,
                key = hash(x, y, zoom);
            
            if ((x + y) % 3 === 0) {
                subdomain = 'a';
            } else if ((x + y) % 3 === 1) {
                subdomain = 'b';
            } else if ((x + y) % 3 === 2) {
                subdomain = 'c';
            }
            
            url = 'https://cartodb-basemaps-' + subdomain + '.global.ssl.fastly.net/light_all/' + zoom + '/' + x + '/' + y + terminator;
            
            // run this in a web worker
            
            return $cordovaFileTransfer
                .download(url, rootDir + '/' + key,
                    {
                        Referer: "http://206.167.183.207"
                    }
                )
                .then(function () {
                    cache[key] = rootDir + '/' + key;
                });
            
        }

        // Convert a {lat,lng} object into tile coordinates at zoom level 0 (basic == zoom 0).
        // Tile coordinates originate in the NorthWest as 0,0. For each zoom level above 0,
        // x and y double. We use basic points because the same point may be needed at many zoom
        // levels, and it is faster to calculate powers of two than to do trig, float division...
        function LLToBasicPoint(LL) {
            var result = {
                x: (LL.lng + 180) / 360,
                y: (1 - Math.log(Math.tan(LL.lat * Math.PI / 180) + 1 / Math.cos(LL.lat * Math.PI / 180)) / Math.PI) / 2
            };
            return result;
        }
    
        // Determines if a segment intersects with a tile (including being contained).
        // QUIRK: x and y must be correct for the zoom level in question, and seg must be
        // a {start,end} object where both properties are Basic Points. They are very 
        // important reasons for this that I don't feel like talking about
        function tileIntersect(x, y, zoom, seg) {
            // the zoomed version of seg
            var segment = {
                    start: {
                        x: Math.pow(2, zoom) * seg.start.x,
                        y: Math.pow(2, zoom) * seg.start.y
                    },
                    end: {
                        x: Math.pow(2, zoom) * seg.end.x,
                        y: Math.pow(2, zoom) * seg.end.y
                    }
                },
                // we convert the segment into a parametric form:
                // x=start.x + t * xTick
                // y=start.y + t * yTick
                // 0 <= t <= 1
                t,
                xTick = segment.end.x - segment.start.x,
                yTick = segment.end.y - segment.start.y;
            
            // interior. If the segment is inside the tile, the start will be inside.
            // There is no need to check the end as well - it will be caught by intersections.
            if (Math.floor((segment.start.x)) === x && Math.floor((segment.start.y)) === y) {
                return true;
            }
            
            //need to check floor and ceiiling for the case where the point is on the high edge
            if (Math.ceil((segment.start.x)) === x && Math.ceil((segment.start.y)) === y) {
                return true;
            }
            
            // Since the edges are either vertical or horizontal, determining intersection is simple.
            // We find the t-value at which the unchanging coordinate
            //      (y for horizontal edges, x for vertical)
            // matches the segment's coordinate. Then we use the t-value to find 
            // the other coordinate's value. If the t-value is between 0 and 1 and the second
            // coordinate is between the beginning and end of the edge, they intersect
            
            // We alternate ceiling and floor to ensure that all four corners are checked
            
            //left edge
            t = (x - segment.start.x) / xTick;
            if (0 <= t && t <= 1) {
                if (Math.ceil(segment.start.y + (t * yTick)) === y + 1) {
                    return true;
                }
            }
            //right edge
            t = (x + 1 - segment.start.x) / xTick;
            if (0 <= t && t <= 1) {
                if (Math.floor(segment.start.y + (t * yTick)) === y) {
                    return true;
                }
            }
            //top edge
            t = (y - segment.start.y) / yTick;
            if (0 <= t && t <= 1) {
                if (Math.floor(segment.start.x + (t * xTick)) === x) {
                    return true;
                }
            }
            //bottom edge
            t = (y + 1 - segment.start.y) / yTick;
            if (0 <= t && t <= 1) {
                if (Math.ceil(segment.start.x + (t * xTick)) === x + 1) {
                    return true;
                }
            }
            
            return false;

        }
    
        // Performs graham's scan to find a convex hull, given a set of {lat,lng} objects.
        // Returns a convex hull of basic points. It starts at the easternmost point and 
        // winds clockwise
        
        function graham(locs) {
            var locations = lodash.map(locs, LLToBasicPoint),
                left = lodash.minBy(locations, 'x'),
                result = [],
                complete = false;
            
            // order the points according to the bearing of the line from the EMP to that point
            // Most negative/nearest to north bearinng first, 
            // Special case: the EMP is first.
            locations = lodash.sortBy(
                locations,
                function (loc) {
                    if (loc.x === left.x) {
                        if (loc.y > left.y) {
                            return Infinity;
                        }
                        return -Infinity;
                    }
                    // this somehow worked when it read loc.x / left.x ?
                    return (loc.y - left.y) / (loc.x - left.x);
                },
                //tiebreaker: if it's left, it has to be first. Otherwise, it doesn't matter 
                function (loc) {
                    if (loc === left) {
                        return -Infinity;
                    }
                    return 0;
                }
            
            );
            lodash.forEach(locations, function (loc) {
                result.push(loc);
                // cross product - remove second-to-last elements as long as they form 
                // a concave angle
                while (result.length > 2 &&
                        (
                            (result[result.length - 2].x - (result[result.length - 3].x)) *
                            (result[result.length - 1].y - (result[result.length - 3].y))
                        ) - (
                            (result[result.length - 2].y - (result[result.length - 3].y)) *
                            (result[result.length - 1].x - (result[result.length - 3].x))
                        ) <= 0
                        ) {
                    result.splice(result.length - 2, 1);
                }
            });
            return result;
        }
    
        // cache all the tiles required to cover the area contained withing the given set of locations
    
        function cacheAll(locations) {
            var // Indices
                x, y,
                // the hull
                hull,
                // The segments of the left and right sides of the hull
                left = [], right = [],
                // The first and last indices of segments which intersec a row from left and right, respectively
                // N, S, E, Westernmost points
                EMP, WMP, SMP, NMP,
                // the promises for each layer of zoom
                layerPromises = [],
                // the highest zoom level to be cached
                maxZoom = 16;
//          parse locations into a convex hull, then split the hull into its left and right sides
//          All segments  point from the top down.
            
            hull = graham(locations);
            NMP = lodash.minBy(hull, 'y');
            SMP = lodash.maxBy(hull, 'y');
            EMP = lodash.maxBy(hull, 'x');
            WMP = lodash.minBy(hull, 'x');
            lodash.times(hull.length, function (index) {
                if (hull[index].y < hull[(index + 1) % hull.length].y) {
                    //right
                    right.push({
                        start: hull[index],
                        end: hull[(index + 1) % hull.length]
                    });
                } else {
                    left.push({
                        start: hull[(index + 1) % hull.length],
                        end: hull[index]
                    });
                }
            });
            
            //put the segments in top down sequence
            left = lodash.sortBy(left, function (point) {
                return point.start.y;
            });
            
            right = lodash.sortBy(right, function (point) {
                return point.start.y;
            });
            
            // for each zoom level, find a rectangular area which encompasses the entire hull
            // scan throught this area, and determine which tiles to cache.
            lodash.forEach(lodash.range(1 + maxZoom), function (zoom) {
                    // Bounds of the rectangle we might be caching
                var X1, X2, Y1, Y2,
                    // indices in the left and right sides of the hull
                    L1, L2, R1, R2,
                    // Whether the scan has reached the left or right side of the hull
                    reachedL, reachedR,
                    // whether the currently scanned tile intersects the right side of the hull
                    intersectR,
                    // the scale factor for this zoom level
                    scale = Math.pow(2, zoom),
                    // the promises of tile downloads for this zoom level
                    promises = [];
                
                Y1 = Math.floor(scale * NMP.y);
                Y2 = Math.floor(scale * SMP.y) + 1;
                X2 = Math.floor(scale * EMP.x) + 1;
                X1 = Math.floor(scale * WMP.x);

                L1 = 0;
                L2 = 0;
                R1 = 0;
                R2 = 0;

                for (y = Y1; y < Y2; y += 1) {
                    L1 = L2;
                    while (L2 < left.length - 1 && scale * left[L2].end.y < y) {
                        L2 += 1;
                    }
                    R1 = R2;
                    while (R2 < right.length - 1 && scale * right[R2].end.y < y) {
                        R2 += 1;
                    }
                    reachedL = false;
                    reachedR = false;
                    intersectR = false;
                    for (x = X1; x < X2; x += 1) {
                        reachedL = reachedL || lodash.some(left.slice(L1, L2 + 1), function (segment) {
                            return tileIntersect(x, y, zoom, segment);
                        });
                        intersectR = lodash.some(right.slice(R1, R2 + 1), function (segment) {
                            return tileIntersect(x, y, zoom, segment);
                        });
                        reachedR = reachedR || intersectR;
                        if (reachedR && !intersectR) {
                            break;
                        }

                        if (reachedL) {
                            // add this to a promise list
                            promises.push(cacheTile(x, y, zoom));
                        }
                    }
                }
                layerPromises.push($q.all(promises));
            });
            
            //TODO: do the layers sequentially?
            return $q.all(layerPromises)
                .then(
                    function () {
                        status.cacheEnabled = true;
                        return writeCache();
                    },
                    function (errors) {
                        $log.error(angular.toJson(errors));
                    }
                )
                .finally(function () {
                    status.working = false;
                });
        }

        return {
            urlFor: function (x, y, zoom, subdomain) {
                return init
                    .then(function () {
                        if (cache[hash(x, y, zoom)]) {
                            return cache[hash(x, y, zoom)];
                        } else if (strictMode || !$cordovaNetwork.isOnline()) {
                            return "img/offline-map-tile.png";
                        } else {
                            return 'https://cartodb-basemaps-' + subdomain + '.global.ssl.fastly.net/light_all/' + zoom + '/' + x + '/' + y + '.png';
                        }
                    });
            },
            createCache: function () {
                status.working = true;
                return server.getAll('geolocations').then(cacheAll);
            },
            destroyCache: function () {
                // file deletion promises
                return deleteCache();
        
            },
            status: status
        };
    });