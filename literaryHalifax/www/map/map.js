angular.module('literaryHalifax')

.directive('markerMap', function() {
  return {
    restrict: 'E',
    scope: {
      // a collection of 'place' objects which have at least
      // id: a unique id
      // location: a location (lat/lng, address...)
      places: '=',
      // the name of the directive to display in the infoWindow. The directive
      // will receive the selected place in the 'place' attribute.
      windowDirective : '@',
      // a location (lat/lng, address...)
      center:'=',
      // an integer which represents how far in the map should be zoomed
      // 0 is the lowest zoom level
      zoom:'=',
      //set to true to make the map center on a marker when it is clicked
      centerOnClick:'='
    },
    templateUrl: 'map/map.html'
  };
})


//This is a simple directive which replaces itself with the directive named
// in windowType
.directive('infoWindowSelector', function($compile) {
    return {
        scope: {
            windowType:  '@',
            place: '='
        },
        link: function(scope, element) {
          var generatedTemplate = '<'+scope.windowType+' place="place"></'+scope.windowType+'>';

          //this function is getting called more than once, so we need to clear out
          //the element each time
          //TODO get this function called only once
          element.empty()
          element.append($compile(generatedTemplate)(scope));
        }
    };
})


.controller('mapCtrl', function($scope, $ionicScrollDelegate, $interval, NgMap) {

  $scope.id="marker-map-id"

  NgMap.getMap($scope.id).then(function(map) {
    $scope.map = map;
  }, function(error){
    console.log(error)
  });


  //prevent scrolling when touching the map
  $scope.fingerDown = function(){
    $ionicScrollDelegate.freezeAllScrolls(true)
  }

  $scope.fingerUp = function(){
    $ionicScrollDelegate.freezeAllScrolls(false)
  }

  //utility function for converting string representations of lat/lng into abjects
  // with the format {lat:30,lng:-60}
  coordinates = function(location){
    tmp = location.split(',')
    return {
      lat:parseFloat(tmp[0]),
      lng:parseFloat(tmp[1])
    }
  }

  var geoUpdatePeriodMillis = 10000

  //periodically check the user's loaction and update it
  $interval(
    function(){
      NgMap.getGeoLocation('current-location', { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true })
      .then(function (latlng) {
        $scope.currentPosition=latlng
      })
    },
    geoUpdatePeriodMillis
  );


  //display an info window.
  handlePlaceClicked = function(place){
    // make the currently selected place available to the info window
    $scope.place = place
    $scope.map.showInfoWindow('infoWindow',place.id)
    if($scope.centerOnClick){
      $scope.map.panTo(coordinates(place.location))
    }
  }

  $scope.markerClicked=function(element, place){
    handlePlaceClicked(place)
  }
})
