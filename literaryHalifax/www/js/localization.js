/*global angular */
/*global cordova */
/*global ionic */
// This service will eventually be the centralized location for everything unique to
// our app - the location of the server, names of pages, etc
angular.module('literaryHalifax')
    .factory('localization', function () {
        "use strict";
        var strings = {
                // Names of states. These appear in the side menu and navigation bars
                // If changing state names, you must change them in app.js as well.
                stateNameLandmarks: "Landmarks",
                stateNameTours: "Tours",
                stateNameCacheControl: "Offline Options",
                // The tag-selection option for "show all tags" appears in the selection menu
                // If a real tag shares this name, there will be problems
                tagNameShowAll: "Show All",
                // Titles of tabs in the Landmark view
                tabNameDescription: "Description",
                tabNameImages: "Images",
                tabNameMap: "Map",
                // Prompts which appear in filter bars when no text is entered 
                filterPromptLandmarks: "Filter by title...",
                filterPromptTours: "Filter by title...",
                // Explanatory text that appears beside caching toggles
                explanationMapCache: "Preload map tiles to make them accessible while offline",
                explanationItemCache: "Preload content to make it accessible while offline",
                // Titles and bodies of confirmation popups which appear when the user attempts to delete a cache
                deleteWarningTitleItemCache: "Turn Caching Off?",
                deleteWarningBodyItemCache: "This will delete all of your cached data. You will have to download it again to use it.",
                deleteWarningTitleMapCache: "Delete cached maps?",
                deleteWarningBodyMapCache: "This will delete the map cache. Using the map will require an internet connection.",
                // Title of the (bodyless) confirmation popup which appears when the use tries to exit the app via back button
                warningPromptExitApp: "Leave App?",
                // a short message that appears below a loading spinner when the app is getting the user's location
                loadMessageGettingLocation: "Getting your location...",
                // a short message that appears below a loading spinner when the app is fetching a landmark
                loadMessageGettingLandmark: "Getting landmark...",
                // a short message that appears below a loading spinner when the app is fetching the first page of landmarks
                loadMessageGettingLandmarks: "Getting landmarks...",
                // a short message that appears below a loading spinner when the app is fetching the a page of landmarks after the first
                loadMessageGettingMoreLandmarks: "Getting more landmarks...",
                // a short error message to display when an error occurs when trying to fetch a page of landmarks
                errorMessageGettingLandmarks: "Something went wrong getting landmarks...",
                // a short message that appears below a loading spinner when the app is fetching the first page of tours
                loadMessageGettingTours: "Getting tours...",
                // a short message that appears below a loading spinner when the app is fetching a page of tours after the first
                loadMessageGettingMoreTours: "Getting more tours...",
                // a short error message that appears when an error occurs fetching a page of tours
                errorMessageGettingTours: "Something went wrong getting tours",
                // a short 'catch all' error message
                errorMessageGenericRequest: "Couldn't complete the request.",
                // an error message that appears when a request is made for an item type that we don't know how to handle
                errorMessageUnknownType: "Unknown item type",
                // an error message that appears when a request takes too long to resolve
                errorMessageTimeout: "Timed out",
                // an error message which appears when window.navigator is undefined so gps won't work
                errorMessageNoNavigator: "No navigator",
                // a unit of distance which is used to measure the distance to a landmark. The word should be short (km, mi, ly) because it is displayed in the top right corner of list items
                distanceUnitAbbreviation: "km"
            },
            numbers = {
                // The number of distance units that separate two latitude lines (NOT longitude lines - the distance between longitude lines varies with latitude)
                distancePerLatitudeLine: 111.1,
                // The highest zoom level on the map
                maxZoom: 16
            },
            resources = {
                // http address of the omeka server
                serverAddress: "http://206.167.183.207/",
                // function which generates urls for map tiles based
                urlForTile: function (x, y, zoom, subdomain) {
                    return 'https://cartodb-basemaps-' + subdomain + '.global.ssl.fastly.net/light_all/' + zoom + '/' + x + '/' + y + '.png';
                },
                // The lat/lng and zoom level for the map's intitial position. This object must be copied before being given to a leaflet map.
                defaultLocation: {
                    lat: 44.6474,
                    lng: -63.5806,
                    zoom: 15
                },
                /// urls or email addresses that the buttons at the bottom of the side menu will link to
                contactInfoFacebook: "https://www.facebook.com/halifaxliterarylandmarks",
                contactInfoEmail: "halifaxliterarylandmarks@gmail.com",
                contactInfoTwitter: "https://twitter.com/halifaxliterary",
                contactInfoInstagram: "https://www.instagram.com/halifaxliterarylandmarks/"
            };
        
        return {
            strings: strings,
            numbers: numbers,
            resources: resources
        };
    
    });