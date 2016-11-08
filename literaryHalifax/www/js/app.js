// Ionic Starter App
angular.module('literaryHalifax', ['ionic','ngMap'])

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

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.stories', {
    url: '/stories',
    views: {
      'menuContent': {
        templateUrl: 'templates/stories.html',
        controller: 'storiesCtrl'
      }
    }
  })
  .state('app.tours', {
    url: '/tours',
    views: {
      'menuContent': {

      }
    }
  })
  .state('app.browseByTopic', {
    url: '/browseByTopic',
    views: {
      'menuContent': {

      }
    }
  })
  .state('app.about', {
    url: '/about',
    views: {
      'menuContent': {

      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/stories');
});
