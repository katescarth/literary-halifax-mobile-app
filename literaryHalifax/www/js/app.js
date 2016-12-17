angular.module('literaryHalifax', ['ionic','ngLodash','nemLogging','ui-leaflet'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
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

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    //push all tab bars to the top (not platform specific)
    $ionicConfigProvider.tabs.position('top')

    /*
     * Note that some states have a 'title' attribute. This is the text displayed
     * in the header bar. If a state has a tite, the menu button will appear in
     * the header bar. Otherwise, the back button will.
     */


    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'menuCtrl'
    })

    .state('app.landmarks', {
        url: '/landmarks',
        title:'Landmarks',
        views: {
            'mainContent': {
                templateUrl: 'templates/landmarks.html',
                controller: 'landmarksCtrl'
            }
        }
    })
    .state('app.tours', {
        url: '/tours',
        title:'Tours',
        views: {
            'mainContent': {
                templateUrl: 'templates/tours.html',
                controller: 'toursCtrl'
            }
        }
    })
    .state('app.cacheControl', {
        url: '/cacheControl',
        title: 'Cache Control',
        views: {
            'mainContent': {
                templateUrl: 'templates/cacheControl.html'

            }
        }
    })
    .state('app.about', {
        url: '/about',
        title:'About',
        views: {
            'mainContent': {
                templateUrl: 'templates/about.html'

            }
        }
    })
    .state('app.landmarkView', {
        url: '/landmark/:landmarkID',
        cache:false,
        views: {
            'mainContent': {
                templateUrl: 'templates/landmark.html',
                controller: 'landmarkCtrl'
                
            }
        }
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
