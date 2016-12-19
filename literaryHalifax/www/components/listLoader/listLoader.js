angular.module('literaryHalifax')
/*
 * Displays a spinner and loading message if a loading message is provided.
 * Displays a red X and error message if an error message is provided.
 * calls the 'refresh' function when the red X is tapped
 * Disappears if no messages are provided. 
 */    
.directive('listLoader', function () {
    return {
        scope: {
            loadingMsg: '=',
            errorMsg: '=',
            refresh:'='
        }
        , templateUrl: 'components/listLoader/listLoader.html'
    }
})