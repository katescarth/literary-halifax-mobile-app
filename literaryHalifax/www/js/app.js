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

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom')
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'menuCtrl'
  })

  .state('app.stories', {
    url: '/stories',
    views: {
      'mainContent': {
        templateUrl: 'templates/stories.html',
        controller: 'storiesCtrl'
      }
    }
  })
  .state('app.stories.map', {
    url: '/map',
    views: {
      'stories': {
        templateUrl: 'templates/stories_map.html',
        controller: 'storiesCtrl'
      }
    }
  }).state('app.stories.list', {
    url: '/list',
    views: {
      'stories': {
        templateUrl: 'templates/stories.html',
        controller: 'storiesCtrl'
      }
    }
  })
  .state('app.tours', {
    url: '/tours',
    views: {
      'mainContent': {
        templateUrl: 'templates/tours.html'

      }
    }
  })
  .state('app.browseByTopic', {
    url: '/browseByTopic',
    views: {
      'mainContent': {
        templateUrl: 'templates/browseByTopic.html'

      }
    }
  })
  .state('app.about', {
    url: '/about',
    views: {
      'mainContent': {
        templateUrl: 'templates/about.html'

      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/stories');
});
