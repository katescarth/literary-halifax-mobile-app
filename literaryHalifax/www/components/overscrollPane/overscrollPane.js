angular.module('literaryHalifax')
//  This component displays the transcluded contents overlayed on whatever
//  is behind the component. The contents are displayed on a  'card' which
//  starts partway down the screen, but can be scrolled all the way up. The
//  scrolling does not affect the content which is overlayed.

//  DO NOT TRANSCLUDE AN <ION-CONTENT> BLOCK
.directive('overscrollPane', function(){
  return {
    transclude: true,
    templateUrl:'components/overscrollPane/overscrollPane.html'
  }
})
