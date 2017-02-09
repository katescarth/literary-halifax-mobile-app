angular.module('literaryHalifax', ['ionic', 'ngLodash', 'nemLogging', 'ui-leaflet', 'ngCordova'])

    .run(function ($ionicPlatform) {
        "use strict";
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        "use strict";
        //push all tab bars to the top (not platform specific)
        $ionicConfigProvider.tabs.position('top');

        /*
         * Note that some states have a 'title' attribute. This is the text displayed
         * in the header bar. If a state has a tite, the menu button will appear in
         * the header bar. Otherwise, the back button will, and the title will remain from the
         * previous state
         */


        $stateProvider

            // parent state for entire app. Responsible for menus, navigation, etc.
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'menuCtrl'
            })

            // shows the user a list of landmarks and a map with their locations.
            .state('app.landmarks', {
                url: '/landmarks',
                title: 'Landmarks',
                views: {
                    'mainContent': {
                        templateUrl: 'templates/landmarks.html',
                        controller: 'landmarksCtrl'
                    }
                }
            })

            // shows the user a list of tours
            .state('app.tours', {
                url: '/tours',
                title: 'Tours',
                views: {
                    'mainContent': {
                        templateUrl: 'templates/tours.html',
                        controller: 'toursCtrl'
                    }
                }
            })

            // allows the user to manage preloading files (audio or images)
            // currently unimplemented
            .state('app.cacheControl', {
                url: '/cacheControl',
                title: 'Offline Options',
                views: {
                    'mainContent': {
                        templateUrl: 'templates/cacheControl.html',
                        controller: 'cacheCtrl'
                    }
                }
            })

            // Displays a simple page from the server.
            // The page provides its own title
            .state('app.page', {
                url: '/page',
                params: {page: null},
                title: 'Page',
                views: {
                    'mainContent': {
                        templateUrl: 'templates/page.html',
                        controller: 'pageCtrl'
                    }
                }
            })

            // Shows information about a specific landmark - its description, location, and images
            .state('app.landmarkView', {
                url: '/landmark/:landmarkID',
                cache: false,
                views: {
                    'mainContent': {
                        templateUrl: 'templates/landmark.html',
                        controller: 'landmarkCtrl'

                    }
                }

            // Shows the user information about a tour - the order of landmarks and a map with 
            // their locations. Also keeps track of which landmark the user is 'currently on'
            }).state('app.tourView', {
                url: '/tour/:tourID',
                views: {
                    'mainContent': {
                        templateUrl: 'templates/tour.html',
                        controller: 'tourCtrl'

                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/landmarks');
    });
