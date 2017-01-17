
// id's of element types defined by omeka
const TEXT=1
const INTERVIEWER=2
const INTERVIEWEE=3
const LOCATION=4//The location of an interview
const TRANSCRIPTION=5
const LOCAL_URL=6
const ORIGINAL_FORMAT=7
const PHYSICAL_DIMENSIONS=10
const DURATION=11
const COMPRESSION=12
const PRODUCER=13
const DIRECTOR=14
const BIT_RATE=15
const TIME_SUMMARY=16
const EMAIL_BODY=17
const SUBJECT_LINE=18
const FROM=19
const TO=20
const CC=21
const BCC=22
const NUMBER_OF_ATTACHMENTS=23
const STANDARDS=24
const OBJECTIVES=25
const MATERIALS=26
const LESSON_PLAN_TEXT=27
const URL=28
const EVENT_TYPE=29
const PARTICIPANTS=30
const BIRTH_DATE=31
const BIRTH_PLACE=32
const DEATH_DATE=33
const OCCUPATION=34
const BIOGRAPHICAL_TEXT=35
const BIBLIOGRAPHY=36

//id's of Dublin Core element types
const CONTRIBUTOR=37
const COVERAGE=38
const CREATOR=39
const DATE=40
const DESCRIPTION=41
const FORMAT=42
const IDENTIFIER=43
const LANGUAGE=44
const PUBLISHER=45
const REALTION=46//a related resource (not a database relation)
const RIGHTS=47
const SOURCE=48
const TOPIC=49
const TITLE=50
const TYPE=51




//id's of elements defined by Curatescape
const SUBTITLE=52
const LEDE=53
const STORY=54
const SPONSOR=55
const FACTOID=56
const RELATED_RESOURCES=57
const OFFICIAL_WEBSITE=58
const STREET_ADDRESS=59
const ACCESS_INFORMATION=60

//id's of item types

// const TEXT=1 Text is both an item type and an element. Fortunately, both the ID's are 1.
// I see no way this could go wrong
const MOVING_IMAGE=3
const ORAL_HISTORY=4
const SOUND=5
const STILL_IMAGE=6
const WEBSITE=7
const EVENT=8
const EMAIL=9
const LESSON_PLAN=10
const HYPERLINK=11
const PERSON=12
const INTERACTIVE_RESOURCE=13
const DATASET=14
const PHYSICAL_OBJECT=15
const SERVICE=16
const SOFTWARE=17
const CURATESCAPE_STORY=18

angular.module('literaryHalifax')

/*

 * Spec for landmark:
 *  id: a unique identifier (str)
 *  name: The name of the landmark (str)
 *  location: the lat,lng of the landmark (object with lat,lng attributes)
 *  streetAddress: the landmark's street address (str)
 *  description: text description of the landmark (array[str]. Each element is a
                 paragraph)
 *  subtitle: A short 'hook' for the landmark (str)
 *  images: a list of images associated with the landmark. (array[image])
 *  audio:  an audio reading of the landmark's description (url)
 *
 
 
 * Spec for image:
 *  full: url of the image at full resolution
 *  squareThumb: url of a square thumbnail of the image
 *  thumb: url of a thumbnail of the image
 
 * Spec for tour:
 *  id: a unique identifier (str)
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
.factory('server', function($timeout,$q,cacheLayer,utils,lodash,$ionicPlatform){
    var SMALL_DELAY = 400
    var LARGE_DELAY = 2000
    var api = "http://206.167.183.207/api"


        $ionicPlatform.ready(function(){
            if(!(ionic.Platform.isAndroid() || ionic.Platform.isIOS())){
                // David's ionic serve address
                // Gods of development forgive me
                api="http://192.168.2.14:8100/api"
            }
        })
    

    
    // converts a landmark from the server to one that matches our spec. 
    // This includes making requests for files and location.
    convertLandmark = function(serverRecord){
        var landmark = {
            id:serverRecord.id,
            images:[],
            audio:"/android_asset/www/audio/TEST_AUDIO.wav"
        }
        var promises = []
        
        promises.push(
            cacheLayer.request(api+'/files?item=' + serverRecord.id)
            .then(function(files){
                lodash.forEach(files,function(file){
                    if(file.metadata.mime_type.startsWith('image')){
                        // TODO this doesn't guarantee the order of the images
                        landmark.images.push(
                            {
                                full:file.file_urls.fullsize,
                                squareThumb:file.file_urls.square_thumbnail,
                                thumb:file.file_urls.thumbnail
                            }
                        )
                    }
                    // TODO add audio handler
                })
            })
        )
        promises.push(
            cacheLayer.request(api+'/geolocations/' + 
                      serverRecord.extended_resources.geolocations.id)
            .then(function(location){
                landmark.location={
                    lat:location.latitude,
                    lng:location.longitude,
                    zoom:location.zoom
                }
                if(!landmark.streetAddress){
                    landmark.streetAddress=location.address
                }
            })
        )
        
        
        for(var i = 0, len = serverRecord.element_texts.length; i < len; i++){
            var resource = serverRecord.element_texts[i]
            switch(resource.element.id){
                case TITLE:
                    landmark.name=resource.text
                    break;
                case SUBTITLE:
                    landmark.subtitle=resource.text
                    break;
                case STORY:
                    landmark.description=resource.text
                    break;
                case STREET_ADDRESS:
                    landmark.streetAddress=resource.text
                    break;
                default:
                    console.log('No rule found for '+resource.element.name)
            }
        }
        
        return $q.all(promises)
        .then(function(){
            return $q.when(landmark)
        }, function(error){
            console.log(error)
            return $q.reject(error)
        })
        
    }
    
    // converts a tour from the server to one that matches our spec. 
    convertTour = function(serverRecord){
        var tour = {
            id:serverRecord.id,
        }
        
        tour.start={
            lat:serverRecord.start.latitude,
            lng:serverRecord.start.longitude,
            zoom:serverRecord.start.zoom
        }
        
        tour.landmarks = _.map(serverRecord.items,
            function(record) {
                return {
                    id: record.id
                }
            }
        )
        tour.name = serverRecord.title
        tour.description = serverRecord.description
        
        return tour
    }

    server = {   
        
        getPages:function(){
            return cacheLayer.request(api+'/simple_pages/')
            .then(function(pages){
                return lodash.map(pages,function(serverRecord){
                    return{
                        title: serverRecord.title,
                        rawHtml: serverRecord.text
                    }
                })
            }, function(error){
                console.log(error)
            })
        },
        landmarkInfo:function(id){
            
            return cacheLayer.request(api+'/items/'+id)
                .then(convertLandmark)
                .then(function(result){
                return result
            })
        },
        getLandmarks:function(nearPoint){

            var landmarks = []
            return cacheLayer.request(api+'/items')
            .then(function(result){
                var promises = []
                lodash.forEach(result,function(landmark){
                    promises.push(
                        convertLandmark(landmark)
                        .then(function(newLandmark){
                            landmarks.push(newLandmark)
                        })
                    )
                })
                return $q.all(promises)
            }, function(error){
                console.log(error)
            }).then(function(){
                
                if(nearPoint){
                    landmarks = lodash.sortBy(landmarks,
                        function(landmark){
                            return utils.distance(nearPoint,landmark.location)
                        }   
                    )
                }
                return $q.when(landmarks)
            })

        },
        
        getTours:function(nearPoint){

            var tours = []
            return cacheLayer.request(api+'/tours')
            .then(
            function(result){
                lodash.forEach(result,function(tour){
                    tours.push(convertTour(tour))
                })            
                
                if(nearPoint){
                    tours = lodash.sortBy(tours,function(tour){
                        return utils.distance(nearPoint,tour.start)
                    })
                }
                return tours
            })

        },
        
        tourInfo:function(id){
            
            return cacheLayer.request(api+'/tours/'+id)
            .then(convertTour).then(function(result){
             
                return result
            })
        }
    }

    return server
})
