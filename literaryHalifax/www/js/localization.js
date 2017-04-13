/*global angular */
/*global cordova */
/*global ionic */
// This service will eventually be the centralized location for everything unique to
// our app - the location of the server, names of pages, etc
angular.module('literaryHalifax')
    .factory('localization', function () {
        "use strict";
        var strings = {
                stateNameLandmarks: "Landmarks",
                stateNameTours: "Tours",
                stateNameCacheControl: "Offline Options",
                tagNameShowAll: "Show All",
                filterPromptLandmarks: "Filter by title...",
                filterPromptTours: "Filter by title...",
                explanationMapCache: "Preload map tiles to make them accessible while offline",
                explanationItemCache: "Preload content to make it accessible while offline",
                deleteWarningTitleItemCache: "Turn Caching Off?",
                deleteWarningBodyItemCache: "This will delete all of your cached data. You will have to download it again to use it.",
                warningPromptExitApp: "Leave App?",
                loadMessageGettingLocation: "Getting your location...",
                loadMessageGettingLandarks: "Getting landmarks...",
                loadMessageGettingMoreLandarks: "Getting more landmarks...",
                errorMessageGettingLandarks: "Something went wrong getting landmarks...",
                loadMessageGettingTours: "Getting tours...",
                loadMessageGettingMoreTours: "Getting more tours...",
                errorMessageGettingTours: "Something went wrong getting tours...",
                errorMessageGenericRequest: "Couldn't complete the request."
                distanceUnitAbbreviation: "km"
            },
            numbers = {
                distancePerLatitudeLine: 111.1
            },
            resources = {
                serverAddress: "http://206.167.183.207/",
                urlForTile: function (x, y, zoom, subdomain) {
                    return 'https://cartodb-basemaps-' + subdomain + '.global.ssl.fastly.net/light_all/' + zoom + '/' + x + '/' + y + '.png';
                },
                defaultLocation: {
                    lat: 44.6474,
                    lng: -63.5806,
                    zoom: 15
                },
                contactInfoFacebook: "https://www.facebook.com/halifaxliterarylandmarks",
                contactInfoEmail: "halifaxliterarylandmarks@gmail.com",
                contactInfoTwitter: "https://twitter.com/halifaxliterary",
                contactInfoInstagram: "https://www.instagram.com/halifaxliterarylandmarks/"
            };
        
    });