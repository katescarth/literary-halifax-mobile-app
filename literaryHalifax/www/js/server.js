// id's of element types defined by omeka
var TEXT = 1;
var INTERVIEWER = 2;
var INTERVIEWEE = 3;
var LOCATION = 4;//The location of an interview
var TRANSCRIPTION = 5;
var LOCAL_URL = 6;
var ORIGINAL_FORMAT = 7;
var PHYSICAL_DIMENSIONS = 10;
var DURATION = 11;
var COMPRESSION = 12;
var PRODUCER = 13;
var DIRECTOR = 14;
var BIT_RATE = 15;
var TIME_SUMMARY = 16;
var EMAIL_BODY = 17;
var SUBJECT_LINE = 18;
var FROM = 19;
var TO = 20;
var CC = 21;
var BCC = 22;
var NUMBER_OF_ATTACHMENTS = 23;
var STANDARDS = 24;
var OBJECTIVES = 25;
var MATERIALS = 26;
var LESSON_PLAN_TEXT = 27;
var URL = 28;
var EVENT_TYPE = 29;
var PARTICIPANTS = 30;
var BIRTH_DATE = 31;
var BIRTH_PLACE = 32;
var DEATH_DATE = 33;
var OCCUPATION = 34;
var BIOGRAPHICAL_TEXT = 35;
var BIBLIOGRAPHY = 36;

//id's of Dublin Core element types
var CONTRIBUTOR = 37;
var COVERAGE = 38;
var CREATOR = 39;
var DATE = 40;
var DESCRIPTION = 41;
var FORMAT = 42;
var IDENTIFIER = 43;
var LANGUAGE = 44;
var PUBLISHER = 45;
var RELATION = 46;//a related resource (not a database relation)
var RIGHTS = 47;
var SOURCE = 48;
var TOPIC = 49;
var TITLE = 50;
var TYPE = 51;




//id's of elements defined by Curatescape
var SUBTITLE = 52;
var LEDE = 53;
var STORY = 54;
var SPONSOR = 55;
var FACTOID = 56;
var RELATED_RESOURCES = 57;
var OFFICIAL_WEBSITE = 58;
var STREET_ADDRESS = 59;
var ACCESS_INFORMATION = 60;

//id's of item types

// var TEXT = 1 Text is both an item type and an element. Fortunately, both the ID's are 1.
// I see no way this could go wrong
var MOVING_IMAGE = 3;
var ORAL_HISTORY = 4;
var SOUND = 5;
var STILL_IMAGE = 6;
var WEBSITE = 7;
var EVENT = 8;
var EMAIL = 9;
var LESSON_PLAN = 10;
var HYPERLINK = 11;
var PERSON = 12;
var INTERACTIVE_RESOURCE = 13;
var DATASET = 14;
var PHYSICAL_OBJECT = 15;
var SERVICE = 16;
var SOFTWARE = 17;
var CURATESCAPE_STORY = 18;

/*global angular */
/*global ionic */
angular.module('literaryHalifax')

/*

 * Spec for landmark:
 *  id: a unique identifier (str, though it's a representation of an integer.)
 *  title: The name of the landmark (str)
 *  location: the lat,lng of the landmark (object with lat,lng attributes)
 *  streetAddress: the landmark's street address (str)
 *  description: main text description of the landmark (str, possibly html?)
 *  subtitle: An alternate title for the landmark (str)
 *  lede: A brief introductory section that is intended to entice the reader to read the full entry. (str, html)
 *  identifier: an unambiguous identifier, its purpose is unclear given we already have id's (str)
 *  related: a list of related items, I assume (array[str])
 *  creator: The person who created/curated the landmark record (not the landmark itself) (str)
 *  subjects: a list of topics the landmark relates to (array[str])
 *  images: a list of images associated with the landmark. (array[image])
 *  audio:  an audio reading of the landmark's description (str, url)
 
 
 * Spec for image:
 *  full: url of the image at full resolution
 *  squareThumb: url of a square thumbnail of the image
 *  thumb: url of a thumbnail of the image
 *  title: title of the image
 *  description: description of the image
 
 * Spec for tour:
 *  id: a unique identifier (str, though it's a representation of an integer.)
 *  name: the name of the tour (str)
 *  description: a description of the tour (str)
 *  landmarks: the landmarks in the tour, in order (array of objects with 'id' attributes)
 *  start: the location of the first landmark in the tour (object with lat, lng attributes)
 
 
 *Spec for server: 

 * getLandmarks(nearPoint): resolves to a list of all landmarks on the server. If a nearPoint
                            is provided, the tours are ordered by their nearness to that point
 * landmarkInfo(id): resolves to an object representing the landmark with the given id
 * getTours(): resolves to a list of all tours on the server
 * tourInfo(id): resolves to an object representing the tour with the given id
 */
    .factory('server', function ($timeout, $q, $log, cacheLayer, utils, lodash, $ionicPlatform) {
        "use strict";
        var SMALL_DELAY = 400,
            LARGE_DELAY = 2000,
            server;
    
        function convertFile(serverRecord) {
            if (serverRecord.metadata.mime_type.startsWith('image')) {
                var imageObj = {
                    full : serverRecord.file_urls.fullsize,
                    squareThumb : serverRecord.file_urls.square_thumbnail,
                    thumb : serverRecord.file_urls.thumbnail
                };

                lodash.forEach(serverRecord.element_texts, function (resource) {
                    switch (resource.element.id) {
                    case TITLE:
                        imageObj.title = resource.text;
                        break;
                    case DESCRIPTION:
                        imageObj.description = resource.text;
                        break;
                    case CREATOR:
                        imageObj.creator = resource.text;
                        break;
                    case SOURCE:
                        imageObj.source = resource.text;
                        break;
                    default:
                        $log.warn('No rule found for ' + resource.element.name);
                    }
                });

                return $q.when(imageObj);
            } else if (serverRecord.metadata.mime_type.startsWith('audio')) {
                return $q.when(serverRecord.file_urls.original);
            }
        }
    
        function convertGeolocation(serverRecord) {
            return $q.when({
                lat : serverRecord.latitude,
                lng : serverRecord.longitude,
                zoom : serverRecord.zoom
            });
        }
    
        // converts a landmark from the server to one that matches our spec. 
        // This includes making requests for files and location.
        function convertLandmark(serverRecord) {
            var landmark = {
                id : serverRecord.id,
                images : [],
                subjects : [],
                related : []
            },
                promises = [];

            landmark.tags = lodash.map(serverRecord.tags, 'name');

            promises.push(
                cacheLayer.filesForItem(serverRecord.id)
                    .then(function (files) {
                        var filePromises = [];
                        lodash.forEach(files, function (file) {
                            var promise = convertFile(file);
                            if (file.metadata.mime_type.startsWith('image')) {
                                promise.then(function (image) {
                                    landmark.images.push(image);
                                });
                            } else if (file.metadata.mime_type.startsWith('audio')) {
                                promise.then(function (audio) {
                                    landmark.audio = audio;
                                });
                            }
                            filePromises.push(promise);
                        });
                        return $q.all(filePromises);
                    }, function (error) {
                        $log.error(error);
                    })
            );
            promises.push(
                cacheLayer.request(
                    cacheLayer.getRequest('geolocations')
                        .setId(serverRecord.extended_resources_mirror.geolocations.id)
                )
                    .then(function (location) {
                        landmark.location = {
                            lat : location.latitude,
                            lng : location.longitude,
                            zoom : location.zoom
                        };
                        if (!landmark.streetAddress) {
                            landmark.streetAddress = location.address;
                        }
                    })
            );

            lodash.forEach(serverRecord.element_texts, function (resource) {
                switch (resource.element.id) {
                case TITLE:
                    landmark.name = resource.text;
                    break;
                case SUBTITLE:
                    landmark.subtitle = resource.text;
                    break;
                case STORY:
                    landmark.description = resource.text;
                    break;
                case STREET_ADDRESS:
                    landmark.streetAddress = resource.text;
                    break;
                case LEDE:
                    landmark.lede = resource.text;
                    break;
                case CREATOR:
                    landmark.creator = resource.text;
                    break;
                case IDENTIFIER:
                    landmark.identifier = resource.text;
                    break;
                // TODO should these be text or objects?
                case RELATED_RESOURCES:
                    landmark.related.push(resource.text);
                    break;
                case TOPIC:
                    landmark.tags.push(resource.text);
                    break;
                default:
                    $log.warn('No rule found for ' + resource.element.name);
                }
            });
            

            return $q.all(promises)
                .then(function () {
                    return $q.when(landmark);
                });

        }

        // converts a tour from the server to one that matches our spec. 
        function convertTour(serverRecord) {
            var tour = {
                id : serverRecord.id
            };

            tour.landmarks = lodash.map(serverRecord.items,
                function (record) {
                    return {
                        id : record.id
                    };
                });
            tour.name = serverRecord.title;
            tour.description = serverRecord.description;
            return convertGeolocation(serverRecord.start).then(
                function (start) {
                    tour.start = start;
                    return tour;
                }
            );
        }
    
    
        function convertPage(serverRecord) {
            return $q.when({
                title : serverRecord.title,
                rawHtml : serverRecord.text
            });
        }
    
        function convertRecord(serverRecord, itemType) {
            if (itemType === 'landmarks') {
                return convertLandmark(serverRecord);
            } else if (itemType === 'tours') {
                return convertTour(serverRecord);
            } else if (itemType === 'simple_pages') {
                return convertPage(serverRecord);
            } else if (itemType === 'geolocations') {
                return convertGeolocation(serverRecord);
            } else if (itemType === 'files') {
                return convertFile(serverRecord);
            } else {
                return $q.reject("unknown item type: " + itemType);
            }
        }

        return {
            getAll: function (itemType) {
                var result = [];
                return cacheLayer.getAll(itemType).then(function (records) {

                    return $q.all(
                        lodash.times(records.length, function (index) {
                            return convertRecord(records[index], itemType)
                                .then(function (converted) {
                                    result[index] = converted;
                                });
                        })
                    ).then(function () {
                        return $q.when(result);
                    });
                });
            },
            
            getPages : function (pageNum, perPage) {
                var req = cacheLayer.getRequest('simple_pages');
                if (pageNum) {
                    req.addParam('page', pageNum);
                }
                if (perPage) {
                    req.addParam('per_page', perPage);
                }
                return cacheLayer.request(req)
                    .then(function (pages) {
                        var result = [];
                        return $q.all(
                            lodash.times(pages.length, function (index) {
                                return convertPage(pages[index]).then(function (page) {
                                    result[index] = page;
                                });
                            })
                        ).then(function () {
                            return result;
                        });
                    });
            },
            
            landmarkInfo : function (id) {
                var req = cacheLayer.getRequest('landmarks').setId(id);
                return cacheLayer.request(req)
                    .then(convertLandmark);
            },
            
            getLandmarks : function (nearPoint, pageNum, perPage) {
                var req = cacheLayer.getRequest('landmarks'),
                    landmarks = [];
                if (nearPoint) {
                    req.addParam('near', nearPoint);
                }
                if (pageNum) {
                    req.addParam('page', pageNum);
                }
                if (perPage) {
                    req.addParam('per_page', perPage);
                }
                return cacheLayer.request(req)
                    .then(function (result) {
                        return $q.all(
                            lodash.times(result.length, function (index) {
                                return convertLandmark(result[index])
                                    .then(function (newLandmark) {
                                        landmarks[index] = newLandmark;
                                    });
                            })
                        ).then(function () {
                            return landmarks;
                        });
                    });
            },

            getTours : function (nearPoint, pageNum, perPage) {
                var req = cacheLayer.getRequest('tours'),
                    tours = [];
                if (nearPoint) {
                    req.addParam('near', nearPoint);
                }
                if (pageNum) {
                    req.addParam('page', pageNum);
                }
                if (perPage) {
                    req.addParam('per_page', perPage);
                }
                return cacheLayer.request(req)
                    .then(function (result) {
                        return $q.all(
                            lodash.times(result.length, function (index) {
                                return convertTour(result[index])
                                    .then(function (newTour) {
                                        tours[index] = newTour;
                                    });
                            })
                        ).then(function () {
                            return tours;
                        });
                    });
            },

            tourInfo : function (id) {
                var req = cacheLayer.getRequest('tours').setId(id);
                return cacheLayer.request(req)
                    .then(convertTour);
            }
        };
    });
