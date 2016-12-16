
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

var landmarks = [
    {
        name:"156 Brook Street",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.6881948,lat:44.6556228},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-1"
    },
    {
        name:"27 Chinook Ct",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.5706411,lat:44.6901274},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-2"
    },
    {
        name:"21 Castleton Crescent",
        description:["Tons and Tons of white lights! (If you like white lights)","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.5421538,lat:44.7050374},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-3"
    },
    {
        name:"104 Cavalier Dr",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.6610852,lat:44.7693574},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-4"
    },
    {
        name:"Louisbourg Lane and Skeena Street",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.5331048,lat:44.6796417},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-5"
    },
    {
        name:"5 Bianca Ct",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.70995740000001,lat:44.7849131},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-6"
    },
    {
        name:"33 Wilson Lake Dr",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.7182899,lat:44.7973234},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-7"
    },
    {
        name:"Flamingo Dr & Meadowlark Crescent",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.755867,lat:44.5443017},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-8"
    },
    {
        name:"Waynewood Dr",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.5194517,lat:44.6478798},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-9"
    },
    {
        name:"Louisburg Lane",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.5277243,lat:44.6774217},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-10"
    },
    {
        name:"Corner of This Street and That Street",
        description:["amazing lights and free candycanes","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.3052397,lat:44.7382136},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-11"
    },
    {
        name:"599 E Chezzetcook Rd",
        description:["A colorful mix of everything!","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.2381178,lat:44.7280959},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-12"
    },
    {
        name:"35 Circle Dr",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.61517040000001,lat:44.6215399},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-13"
    },
    {
        name:"6 Cherry Drive",
        description:["Stop by this place for Christmas cheer. So many great lights & things to see.","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.5756063,lat:44.6751572},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-14"
    },
    {
        name:"Connaught and Norwood House",
        description:["Apparently a local doctor, house it always done really well","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.5930035,lat:44.6435478},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-15"
    },
    {
        name:"38 Canary Crescent",
        description:["These people put out a ton of lights and inflatables each year. My kids always love this house!","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.6539267,lat:44.6689088},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-16"
    },
    {
        name:"Middle Sackville",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.7267894,lat:44.808074},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-17"
    },
    {
        name:"1273 Wright Ave",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.5765956,lat:44.6397625},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-18"
    },
    {
        name:"Point 21",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.6324477,lat:44.6456052},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-19"
    },
    {
        name:"Lobster trap tree",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.4849262,lat:44.6064489},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-20"
    },
    {
        name:"211 Taranaki Dr",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.4949014,lat:44.6934844},
        audio:"/android_asset/www/audio/JBR.mp3",
        id:"christmas-id-21"
    },
    {
        name:"corner of Flamingo Drive and Meadowlark",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.6552465,lat:44.6692289},
        audio:"/android_asset/www/audio/SBS.mp3",
        id:"christmas-id-22"
    },
    {
        name:"206 Westwood Boulevard",
        description:["Over 16 thousand lights on this property","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.866272,lat:44.7086822},
        audio:"/android_asset/www/audio/SBS.mp3",
        id:"christmas-id-23"
    },
    {
        name:"31 Canary Crescent",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.6539267,lat:44.6689088},
        audio:"/android_asset/www/audio/SBS.mp3",
        id:"christmas-id-24"
    },
    {
        name:"11 Faders Rd",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.80943079999997,lat:44.52697339999999},
        audio:"/android_asset/www/audio/SBS.mp3",
        id:"christmas-id-25"
    },
    {
        name:"5010 Nova Scotia Trunk 7",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.2951946,lat:44.7477201},
        audio:"/android_asset/www/audio/SBS.mp3",
        id:"christmas-id-26"
    },
    {
        name:"Lakeshire Crescent",
        description:["Two houses right across from school lit up really really well. One even plays xmas music!","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-61.9948733,lat:44.7106418},
        audio:"/android_asset/www/audio/SBS.mp3",
        id:"christmas-id-27"
    },
    {
        name:"55 appian way",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.5464668,lat:44.7011941},
        audio:"/android_asset/www/audio/SBS.mp3",
        id:"christmas-id-28"
    },
    {
        name:"Point 29",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.6043221,lat:44.6431854},
        audio:"/android_asset/www/audio/SBS.mp3",
        id:"christmas-id-29"
    },
    {
        name:"181 Old Beaver Bank Rd",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.69096810000002,lat:44.7773517},
        audio:"/android_asset/www/audio/SBS.mp3",
        id:"christmas-id-30"
    },
    {
        name:"The Bicycle Thief",
        description:["Someone suggested that these were cool-looking christmas lights. Why don't you go check them out?","Christmas lights (also known informally as fairy lights) are lights used for decoration in preparation for Christmas and for display throughout Christmastide. The custom goes back to the use of candles to decorate the Christmas tree in Christian homes in early modern Germany. Christmas trees displayed publicly and illuminated with electric lights became popular in the early 20th century. By the mid-20th century, it became customary to display strings of electric lights as along streets and on buildings Christmas decorations detached from the Christmas tree itself. In the United States, it became popular to outline private homes with such Christmas lights in tract housing beginning in the 1960s. By the late 20th century, the custom had also been adopted in non-western countries / regions, notably in Japan and Hong Kong.","If you like these lights, consider taking a picture and emailing them to me"],
        images:["img/lights1.png", "img/lights2.png", "img/lights3.png"],
        location:{lng:-63.568435799999975,lat:44.643625},
        audio:"/android_asset/www/audio/SBS.mp3",
        id:"christmas-id-31"
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
.factory('server', function($timeout,$q,$http,utils,lodash){
    var SMALL_DELAY = 400
    var LARGE_DELAY = 2000


    convertLandmark = function(landmarkJson){
        
        var landmark = {
            id:landmarkJson.id,
            images:[]
        }
        var promises = []
        
        promises.push(
            $http.get('http://192.168.2.14:8100/api/files?item=' + landmarkJson.id)
            .then(function(files){
                lodash.forEach(files.data,function(file){
                    if(file.metadata.mime_type.startsWith('image')){
                        landmark.images.push(file.file_urls.original)
                    }   
                })
            })
        )
        promises.push(
            $http.get('http://192.168.2.14:8100/api/geolocations/' + 
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
            return $http.get('http://192.168.2.14:8100/api/items')
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
            
            return $http.get('http://192.168.2.14:8100/api/items/'+id)
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
