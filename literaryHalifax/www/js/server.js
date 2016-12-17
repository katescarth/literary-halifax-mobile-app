
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

var tours = [
    {
        name:"Prime numbered lights",
        description:"Only the prime numbered ids",
        landmarks:[
            {id:"christmas-id-2"},
            {id:"christmas-id-3"},
            {id:"christmas-id-5"},
            {id:"christmas-id-7"},
            {id:"christmas-id-11"},
            {id:"christmas-id-13"},
            {id:"christmas-id-17"},
            {id:"christmas-id-23"},
            {id:"christmas-id-29"},
            {id:"christmas-id-31"}
        ],
        id:"tour-id-1"
    },
    {
        name:"Someone messed up",
        description:"This tour is just here to showcase someone putting the pin in the middle of the ocean. You're going to need a solid wetsuit to complete this one.",
        landmarks:[
            {id:"christmas-id-27"}
        ],
        id:"tour-id-2"
    },
    {
        name:"Central Halifax",
        description:"All the lights in the city",
        landmarks:[
            {id:"christmas-id-15"},//connaught
            {id:"christmas-id-29"},
            {id:"christmas-id-18"},//Wright
            {id:"christmas-id-31"}//Thief
        ],
        id:"tour-id-3"
    },
    {
        name:"The full Monty",
        description:"All the lights in the system in more or less random order. Hang on to my hat, I'm going in!",
        landmarks:[
            {id:"christmas-id-8"},
            {id:"christmas-id-12"},
            {id:"christmas-id-17"},
            {id:"christmas-id-22"},
            {id:"christmas-id-10"},
            {id:"christmas-id-18"},
            {id:"christmas-id-7"},
            {id:"christmas-id-21"},
            {id:"christmas-id-25"},
            {id:"christmas-id-14"},
            {id:"christmas-id-27"},
            {id:"christmas-id-1"},
            {id:"christmas-id-28"},
            {id:"christmas-id-30"},
            {id:"christmas-id-3"},
            {id:"christmas-id-6"},
            {id:"christmas-id-24"},
            {id:"christmas-id-5"},
            {id:"christmas-id-25"},
            {id:"christmas-id-11"},
            {id:"christmas-id-20"},
            {id:"christmas-id-31"},
            {id:"christmas-id-15"},
            {id:"christmas-id-13"},
            {id:"christmas-id-26"},
            {id:"christmas-id-23"},
            {id:"christmas-id-29"},
            {id:"christmas-id-4"},
            {id:"christmas-id-16"}
        ],
        id:"tour-id-4"
    }
]
angular.module('literaryHalifax')

/*
 * Right now, this is all fixture data. The purpose of this code is to separate
 * the rest of the app from the server (this is the only part of the code that
 * knows there's not actually a server)

 * Spec for landmark:
 *  id: a unique identifier (str)
 *  name: The name of the landmark (str)
 *  location: the lat,lng of the landmark (str)
 *  description: text description of the landmark (array[str]. Each element is a
                 paragraph)
 *  subtit;e: A short 'hook' for the landmark (str)
 *  images: a list of images associated with the landmark. The first image is the
            thumbnail/main image (array[image])
 *  audio:  an audio reading of the stroy's description
 *
 
 *Spec for server: 

 * getLandmarks(attrs): resolves to a list of landmarks with the specified attributes 
                      filled in
 * landmarkInfo(id, attributes): resolves to an object with all of the properties
                              listed in attributes (a string array). The values
                              for these properties are copied from the landmark
                              matching id
 */
.factory('server', function($timeout,$q,$http,utils,lodash,$ionicPlatform){
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
    
    

    convertLandmark = function(landmarkJson){
        
        var landmark = {
            id:landmarkJson.id,
            images:[]
        }
        var promises = []
        
        promises.push(
            $http.get(api+'/files?item=' + landmarkJson.id)
            .then(function(files){
                lodash.forEach(files.data,function(file){
                    if(file.metadata.mime_type.startsWith('image')){
                        landmark.images.push(
                            {
                                full:file.file_urls.fullsize,
                                squareThumb:file.file_urls.square_thumbnail,
                                thumb:file.file_urls.thumbnail
                            }
                        )
                    }   
                })
            })
        )
        promises.push(
            $http.get(api+'/geolocations/' + 
                      landmarkJson.extended_resources.geolocations.id)
            .then(function(location){
                landmark.location={
                    lat:location.data.latitude,
                    lng:location.data.longitude,
                    zoom:location.data.zoom
                }
                if(!landmark.streetAddress){
                    landmark.streetAddress=location.data.address
                }
            })
        )
        
        
        for(var i = 0, len = landmarkJson.element_texts.length; i < len; i++){
            var text = landmarkJson.element_texts[i]
            switch(text.element.id){
                case TITLE:
                    landmark.name=text.text
                    break;
                case SUBTITLE:
                    landmark.subtitle=text.text
                    break;
                case STORY:
                    landmark.description=text.text
                    break;
                case STREET_ADDRESS:
                    landmark.streetAddress=text.text
                    break;
                default:
                    console.log('No rule found for '+text.element.name)
            }
        }
        
        return $q.all(promises)
        .then(function(){
            return $q.when(landmark)
        }, function(error){
            console.log(error)
        })
        
    }

    server = {
        getLandmarks:function(attrs, nearPoint){

            var landmarks = []
            return $http.get(api+'/items')
            .then(
            function(result){
                var promises = []
                lodash.forEach(result.data,function(landmark){
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
                    dist = function(landmark){
                        return utils.distance(nearPoint,landmark.location)
                    }
                    landmarks = lodash.sortBy(landmarks,dist)
                }
                
                return $q.when(landmarks)
            })

        },
        
        
        landmarkInfo:function(id){
            
            return $http.get(api+'/items/'+id)
            .then(function(result){
                return convertLandmark(result.data)
            }).then(function(result){
                console.log(result)
                return result
            })
        },
        
        getTours:function(nearPoint){
            var result = []
            var i=0
            var j=0
            for(i=0;i<tours.length;i++){
                result.push(angular.extend({},tours[i]))
            }
            
            
            // the start of a tour is the location of its first landmark
            for(i=0;i<result.length;i++){
                for(j=0;j<landmarks.length;j++){
                    if(landmarks[j].id==result[i].landmarks[0].id){
                        result[i].start=landmarks[j].location
                    }
                }
            }
            
            if(nearPoint){
                result=lodash.sortBy(result, function(tour){
                    return utils.distance(nearPoint,tour.start)
                })
            }

            return $timeout(function(){
                return result
            }, SMALL_DELAY)
        },
        
        
        tourInfo:function(id,attributes){
            var result = {}
            var i=0
            for(i=0;i<tours.length;i++){

                if(tours[i].id==id){
                    var j=0
                    for(j=0;j<attributes.length;j++){
                        result[attributes[j]] =tours[i][attributes[j]]
                    }

                    return $timeout(function(){
                        return result
                    }, SMALL_DELAY)
                }
            }
        },
        // Helper method for updating a tour object without requesting 
        // extra info. This is not fixture code, it belongs in the final product.
        updateTour:function(tour, attributes){
            if(!tour.id){
                return $q.reject("attempted to update a tour with no id")
            }
            var i=0
            var newAttrs = []
            for(i=0;i<attributes.length;i++){
                if(!tour[attributes[i]]){
                   newAttrs.push(attributes[i])
                }
            }
            if(newAttrs.length>0){
                console.log(newAttrs)
                return server.tourInfo(tour.id,newAttrs)
                .then(function(newTour){
                    angular.extend(tour,newTour)
                    return tour
                })
            }  else {
                return $q.when(tour)
            }
        }
    }

    return server
})
