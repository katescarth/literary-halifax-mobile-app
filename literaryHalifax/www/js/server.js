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
.factory('server', function($timeout,$q){
    var SMALL_DELAY = 200
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
            name:"Halifax Central Library",
            location:"44.6431,-63.5752",
            description:[
                "The Halifax Central Library is a public library in \
                Halifax, Nova Scotia on the corner of Spring Garden Road \
                and Queen Street. It serves as the flagship library of the \
                Halifax Public Libraries, replacing the Spring Garden Road \
                Memorial Library.",

                "A new central library was discussed by library \
                administrators for several decades and approved by the \
                regional council in 2008. The architects, a joint venture \
                between local firm Fowler Bauld and Mitchell and Schmidt \
                Hammer Lassen of Denmark, were chosen in 2010 through an \
                international design competition. Construction began later \
                that year on a prominent downtown site that had been a \
                parking lot for half a century.",

                "The new library opened in December 2014 and has become a \
                highly popular gathering place. In addition to a book \
                collection significantly larger than that of the former \
                library, the new building houses a wide range of amenities \
                including cafés, an auditorium, and community rooms. The \
                striking architecture is characterised by the fifth floor's \
                cantilever over the entrance plaza, a central atrium \
                criss-crossed by staircases, and the building's \
                transparency and relationship to the urban context. The \
                library won a Lieutenant Governor’s Design Award in \
                Architecture for 2014."
            ],
            id: "landmark-id-1",
            images:["img/HCL1.jpg"],
            audio:"/android_asset/www/audio/library.mp3"
        },
        {
            name:"Public Gardens",
            location:"44.6428,-63.5821",
            description:[
                "The Halifax Public Gardens are Victorian era public \
                gardens formally established in 1867, the year of Canadian \
                Confederation. The gardens are located in the Halifax \
                Regional Municipality, Nova Scotia on the Halifax \
                Peninsula near the popular shopping district of Spring \
                Garden Road and opposite Victoria Park. The gardens were \
                designated a National Historic Site of Canada in 1984."
            ],
            id: "landmark-id-2",
            images:["img/PBG1.jpg"],
            audio:"/android_asset/www/audio/static.mp3"
        },
        {
            name:"The Dingle",
            location:"44.6304,-63.6028",
            description:[
                "Sandford Fleming Park is a 95-acre (38 ha) Canadian urban \
                park located in the community of Jollimore in Halifax \
                Regional Municipality. It is also known as Dingle Park \
                which means wooded valley. The park was donated to the \
                people of Halifax by Sir Sandford Fleming. The centrepiece \
                of the park is an impressive tower that commemorates Nova \
                Scotia's achievement of representative government in 1758. \
                Completed between 1908 and 1912, the Memorial Tower was \
                erected during the same period of building other \
                commemorative towers in the British Commonwealth, notably \
                Cabot Tower in Bristol, England (1898) and Cabot Tower \
                in St. John's (1900)"
            ],
            id: "landmark-id-3",
            images:["img/DNG1.jpg"],
            audio:"/android_asset/www/audio/tower.mp3"
        },
        {
            name:"Old Burying Ground",
            location:"44.6437,-63.5728",
            description:[
                "The Old Burying Ground was founded in 1749, the same year \
                as the settlement, as the town's first burial ground. It \
                was originally non-denominational and for several decades \
                was the only burial place for all Haligonians. (The burial \
                ground was also used by St. Matthew's United Church \
                (Halifax).) In 1793 it was turned over to the Anglican \
                St. Paul's Church. The cemetery was closed in 1844 and \
                the Camp Hill Cemetery established for subsequent \
                burials. The site steadily declined until the 1980s when \
                it was restored and refurbished by the Old Burying \
                Ground Foundation, which now maintains the site and \
                employ tour guides to interpret the site in the summer. \
                Ongoing restoration of the rare 18th century grave \
                markers continues.",

                "Over the decades some 12,000 people were interred in \
                the Old Burial Ground. Today there are only some 1,200 \
                headstones, some having been lost and many others being \
                buried with no headstone. Many notable residents are \
                buried in the cemetery, including British Major General \
                Robert Ross, who led the successful Washington Raid of \
                1814 and burned the White House before being killed in \
                battle at Baltimore a few days later.",

                "The most prominent structure is the Welsford-Parker \
                Monument, a Triumphal arch standing at the entrance to \
                the cemetery commemorating British victory in the \
                Crimean War. This is the second oldest war monument in \
                Canada and the only monument to the Crimean War in North \
                America. The arch was built in 1860, 16 years after the \
                cemetery had officially closed. The arch was built by \
                George Lang and is named after two Haligonians, Major \
                Augustus Frederick Welsford and Captain William Buck \
                Carthew Augustus Parker. Both Nova Scotians died in the \
                Battle of the Great Redan during the Siege of Sevastopol \
                (1854–1855). This monument was the last grave marker in \
                the cemetery.",

                "The Old Burying Ground was designated a National \
                Historic Site of Canada in 1991. It had earlier been \
                designated a Provincially Registered Property in 1988 \
                under Nova Scotia's Heritage Property Act."
            ],
            id: "landmark-id-4",
            images: [
                "img/OBG1.png",
                "img/OBG2.png"
            ],
            audio:"/android_asset/www/audio/cemetary.ogg"
        }
    ]



    server = {
        getLandmarks:function(attrs){

            var result = []
            var i=0

            for(i=0;i<landmarks.length;i++){
                result.push(angular.extend({},landmarks[i]))
            }

            return $timeout(function(){
                return result
            }, SMALL_DELAY)

        },
        landmarkInfo:function(id, attributes){
            var result = {}
            var i=0
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
        
        getTours:function(){
            var result = []
            var i=0

            for(i=0;i<tours.length;i++){
                result.push(angular.extend({},tours[i]))
            }

            return $timeout(function(){
                console.log(result)
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
