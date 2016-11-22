/*
* This component displays the transcluded contents overlayed on whatever
* is behind the component. The contents are displayed starting partway down
* the screen, but can be scrolled all the way up. The scrolling does not affect
* the content which is overlayed.
* DO NOT TRANSCLUDE AN <ION-CONTENT> BLOCK
*/
angular.module('literaryHalifax')
.directive('overscrollPane', function(){
  return {
    transclude: true,
    templateUrl:'components/overscrollPane/overscrollPane.html'
  }
})
