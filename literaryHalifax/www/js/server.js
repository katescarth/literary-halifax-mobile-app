angular.module('literaryHalifax')

/*
 * Right now, this is all fixture data. The purpose of this code is to separate
 * the rest of the app from the server (this is the only part of the code that
 * knows there's not actually a server)

 * Spec for landmark:
 *  id: a unique identifier (str)
 *  name: The name of the landmark (str)
 *  location: the lat,lng of the landmark (str) TODO update to numerical data
 *  description: text description of the landmark (array[str]. Each element is a
                 paragraph)
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
.factory('server', function($timeout,$q,utils,lodash){
    var SMALL_DELAY = 400
    var LARGE_DELAY = 2000

    var tours = [
        {
            name:"Central Halifax",
            description:"A tour of the Landmarks in central halifax",
            landmarks:[
                {id:"landmark-id-1"},
                {id:"landmark-id-2"},
                {id:"landmark-id-4"}
            ],
            id:"tour-id-1"
        },
        {
            name:"The Full Monty",
            description:"Every landmark in the system, in the best order. There is no better tour in the system",
            landmarks:[
                {id:"landmark-id-4"},
                {id:"landmark-id-1"},
                {id:"landmark-id-2"},
                {id:"landmark-id-3"}
            ],
            id:"tour-id-2"
        }
    ]

    var landmarks = [
		{
			name:"156 Brook Street",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.6881948,lat:44.6556228},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-1"
		},
		{
			name:"27 Chinook Ct",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.5706411,lat:44.6901274},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-2"
		},
		{
			name:"21 Castleton Crescent",
			description:["Tons and Tons of white lights! (If you like white lights)","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.5421538,lat:44.7050374},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-3"
		},
		{
			name:"104 Cavalier Dr",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.6610852,lat:44.7693574},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-4"
		},
		{
			name:"Louisbourg Lane and Skeena Street",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.5331048,lat:44.6796417},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-5"
		},
		{
			name:"5 Bianca Ct",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.70995740000001,lat:44.7849131},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-6"
		},
		{
			name:"33 Wilson Lake Dr",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.7182899,lat:44.7973234},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-7"
		},
		{
			name:"Flamingo Dr & Meadowlark Crescent",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.755867,lat:44.5443017},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-8"
		},
		{
			name:"Waynewood Dr",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.5194517,lat:44.6478798},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-9"
		},
		{
			name:"Louisburg Lane",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.5277243,lat:44.6774217},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-10"
		},
		{
			name:"Corner of This Street and That Street",
			description:["amazing lights and free candycanes","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.3052397,lat:44.7382136},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-11"
		},
		{
			name:"599 E Chezzetcook Rd",
			description:["A colorful mix of everything!","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.2381178,lat:44.7280959},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-12"
		},
		{
			name:"35 Circle Dr",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.61517040000001,lat:44.6215399},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-13"
		},
		{
			name:"6 Cherry Drive",
			description:["Stop by this place for Christmas cheer. So many great lights & things to see.","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.5756063,lat:44.6751572},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-14"
		},
		{
			name:"Connaught and Norwood House",
			description:["Apparently a local doctor, house it always done really well","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.5930035,lat:44.6435478},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-15"
		},
		{
			name:"38 Canary Crescent",
			description:["These people put out a ton of lights and inflatables each year. My kids always love this house!","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.6539267,lat:44.6689088},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-16"
		},
		{
			name:"Middle Sackville",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.7267894,lat:44.808074},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-17"
		},
		{
			name:"1273 Wright Ave",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.5765956,lat:44.6397625},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-18"
		},
		{
			name:"Point 21",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.6324477,lat:44.6456052},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-19"
		},
		{
			name:"Lobster trap tree",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.4849262,lat:44.6064489},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-20"
		},
		{
			name:"211 Taranaki Dr",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.4949014,lat:44.6934844},
			audio:"/android_asset/www/audio/JBR.mp3",
            id:"christmas-id-21"
		},
		{
			name:"corner of Flamingo Drive and Meadowlark",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.6552465,lat:44.6692289},
			audio:"/android_asset/www/audio/SBS.mp3",
            id:"christmas-id-22"
		},
		{
			name:"206 Westwood Boulevard",
			description:["Over 16 thousand lights on this property","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.866272,lat:44.7086822},
			audio:"/android_asset/www/audio/SBS.mp3",
            id:"christmas-id-23"
		},
		{
			name:"31 Canary Crescent",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.6539267,lat:44.6689088},
			audio:"/android_asset/www/audio/SBS.mp3",
            id:"christmas-id-24"
		},
		{
			name:"11 Faders Rd",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.80943079999997,lat:44.52697339999999},
			audio:"/android_asset/www/audio/SBS.mp3",
            id:"christmas-id-25"
		},
		{
			name:"5010 Nova Scotia Trunk 7",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.2951946,lat:44.7477201},
			audio:"/android_asset/www/audio/SBS.mp3",
            id:"christmas-id-26"
		},
		{
			name:"Lakeshire Crescent",
			description:["Two houses right across from school lit up really really well. One even plays xmas music!","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-61.9948733,lat:44.7106418},
			audio:"/android_asset/www/audio/SBS.mp3",
            id:"christmas-id-27"
		},
		{
			name:"55 appian way",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.5464668,lat:44.7011941},
			audio:"/android_asset/www/audio/SBS.mp3",
            id:"christmas-id-28"
		},
		{
			name:"Point 29",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.6043221,lat:44.6431854},
			audio:"/android_asset/www/audio/SBS.mp3",
            id:"christmas-id-29"
		},
		{
			name:"181 Old Beaver Bank Rd",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.69096810000002,lat:44.7773517},
			audio:"/android_asset/www/audio/SBS.mp3",
            id:"christmas-id-30"
		},
		{
			name:"The Bicycle Thief",
			description:["graf1","graf2","graf3"],
			images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
			location:{lng:-63.568435799999975,lat:44.643625},
			audio:"/android_asset/www/audio/SBS.mp3",
            id:"christmas-id-31"
		}
]



    server = {
        getLandmarks:function(attrs, nearPoint){

            var result = []
            var i=0

            for(i=0;i<landmarks.length;i++){
                result.push(angular.extend({},landmarks[i]))
            }
            
            if(nearPoint && lodash.includes(attrs,'location')){
                result=lodash.sortBy(result,
                    function(landmark){
                        return utils.distance(nearPoint,landmark.location)
                    }
                )
            }

            return $timeout(function(){
                return result
            }, SMALL_DELAY)

        },
        landmarkInfo:function(id, attributes){
            var result = {}
            var i=0
            var j=0
            for(i=0;i<landmarks.length;i++){

                if(landmarks[i].id==id){
                    var j=0
                    for(j=0;j<attributes.length;j++){
                        result[attributes[j]] =landmarks[i][attributes[j]]
                    }

                    return $timeout(function(){
                        return result
                    }, LARGE_DELAY)
                }
            }
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
        // Helper method for updating a landmark object without requesting 
        // extra info. This is not fixture code, it belongs in the final product.
        updateLandmark:function(landmark, attributes){
            if(!landmark.id){
                return $q.reject("attempted to update a landmark with no id")
            }
            var i=0
            newAttrs = []
            for(i=0;i<attributes.length;i++){
                if(!landmark[attributes[i]]){
                   newAttrs.push(attributes[i])
                }
            }
            if(newAttrs.length>0){
                return server.landmarkInfo(landmark.id,newAttrs)
                .then(function(newLandmark){
                    angular.extend(landmark,newLandmark)
                    return landmark
                })
            }  else {
                return $q.when(landmark)
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
