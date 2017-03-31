/*global angular */
/*global cordova */
/*global ionic */
angular.module('literaryHalifax')
    .factory('mapCache', function ($log, $cordovaFileTransfer, $cordovaFile, $cordovaNetwork, $ionicPlatform, $q, lodash, server) {

        "use strict";
        var strictMode = true,
            filename = "mapCache",
            rootDir,
            initDeferred = $q.defer(),
            init = initDeferred.promise,
            cache = {};
        $ionicPlatform.ready(function () {
            if (typeof cordova !== 'undefined') {
                rootDir = cordova.file.dataDirectory;
            } else {
                $log.error("Cordova is not defined. Are you on a mobile device?");
            }
            
            $cordovaFile.checkFile(rootDir, filename)
                .then(function () {
                    return $cordovaFile.readAsText(rootDir, filename)
                        .then(function (json) {
                            cache = angular.fromJson(json);
                            initDeferred.resolve();
                        });
                }).then(undefined, function (error) {
                    // The file doesn't exist
                    initDeferred.resolve();
                });
            
            
        });
    
        function hash(x, y, zoom) {
            return x + '/' + y + '/' + zoom;
        }
    
        function cacheTile(x, y, zoom) {
            var subdomain;
            
            if ((x + y) % 3 === 0) {
                subdomain = 'a';
            } else if ((x + y) % 3 === 1) {
                subdomain = 'b';
            } else if ((x + y) % 3 === 2) {
                subdomain = 'c';
            }
            
            cache[hash(x, y, zoom)] = 'https://cartodb-basemaps-' + subdomain + '.global.ssl.fastly.net/light_all/' + zoom + '/' + x + '/' + y + '.png';
        }
    
        function LLToBasicPoint(LL) {
            var result = {
                x: (LL.lng + 180) / 360,
                y: (1 - Math.log(Math.tan(LL.lat * Math.PI / 180) + 1 / Math.cos(LL.lat * Math.PI / 180)) / Math.PI) / 2
            };
            return result;
        }
        function tileIntersect(x, y, zoom, seg) {
            // the segment is not zoomed in yet
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
                t,
                xTick = segment.end.x - segment.start.x,
                yTick = segment.end.y - segment.start.y;
            
            
            if (Math.floor((segment.start.x)) === x && Math.floor((segment.start.y)) === y) {
                return true;
            }
            
            //left edge
            t = (x - segment.start.x) / xTick;
            if (0 <= t && t <= 1) {
                if (Math.floor(segment.start.y + (t * yTick)) === y) {
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
                if (Math.floor(segment.start.x + (t * xTick)) === x) {
                    return true;
                }
            }
            
            return false;

        }
    
        function graham(locs) {
            var locations = lodash.map(locs, LLToBasicPoint),
                left = lodash.minBy(locations, 'x'),
                result = [],
                complete = false;
            locations = lodash.sortBy(locations, function (loc) {
                if (loc === left) {
                    return -Infinity;
                }
                return (loc.y - left.y) / (loc.x / left.x);
            });
            lodash.forEach(locations, function (loc) {
                result.push(loc);
                // cross product
                while (result.length > 2 &&
                    (
                        (result[result.length - 2].x - (result[result.length - 3].x)) *
                        (result[result.length - 1].y - (result[result.length - 3].y))
                    ) - (
                        (result[result.length - 2].y - (result[result.length - 3].y)) *
                        (result[result.length - 1].x - (result[result.length - 3].x))
                    ) < 0
                ) {
                    result.splice(result.length - 2, 1);
                }
            });
            return result;
        }
    
        function cacheAll(locations) {
            var // Indices
                x, y,
                // the hull
                hull,
                // The segments of the left and right sides of the hull
                left = [], right = [],
                // The first and last indices of segments which intersec a row from left and right, respectively
                // N, S, E, Westernmost points
                EMP, WMP, SMP, NMP;
            
            
//          parse locations into a hull, then split them into left and right
//          Both hulls should point from the bottom up. This will involve reversing the left side of the hull
//          and turning the segments around
            
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
            
            
            left = lodash.sortBy(left, function (point) {
                return point.start.y;
            });
            
            right = lodash.sortBy(right, function (point) {
                return point.start.y;
            });
            
            //14=max zoom
            lodash.times(15, function (zoom) {
                    // Bounds of the rectangle we might be caching
                var X1, X2, Y1, Y2,
                    // indices in the left and right sides of the hull
                    L1, L2, R1, R2,
                    // Whether the scan has reached the left or right side of the hull
                    reachedL, reachedR,
                    // whether the currently scanned tile intersects the right side of the hull
                    intersectR,
                    // the scale factor for this zoom level
                    scale = Math.pow(2, zoom + 0);
                
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
                            return tileIntersect(x, y, zoom + 0, segment);
                        });
                        intersectR = lodash.some(right.slice(R1, R2 + 1), function (segment) {
                            return tileIntersect(x, y, zoom + 0, segment);
                        });
                        reachedR = reachedR || intersectR;
                        reachedR = reachedR || intersectR;
                        if (reachedR && !intersectR) {
                            break;
                        }

                        if (reachedL) {
                            cacheTile(x, y, zoom + 0);
                        }
                    }
                }
            });
        }
        server.getAll('geolocations').then(cacheAll);
        return {
            urlFor: function (x, y, zoom, subdomain) {
                return init
                    .then(function () {
                        if (cache[hash(x, y, zoom)]) {
                            return cache[hash(x, y, zoom)];
                        } else if (strictMode) {
                            return "img/offline-map-tile.png";
                        } else {
                            return 'https://cartodb-basemaps-' + subdomain + '.global.ssl.fastly.net/light_all/' + zoom + '/' + x + '/' + y + '.png';
                        }
                    });
            },
            createCache: function () {
                
            },
            destroyCache: function () {
                
            }
        };
    });