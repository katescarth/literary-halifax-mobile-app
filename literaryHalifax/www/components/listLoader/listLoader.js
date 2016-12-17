angular.module('literaryHalifax')
/*
 * Displays a spinner and loading message if a message is provided.
 * Disappears when no message is provided. TODO display error messages,
 * probaby with a big red X icon.
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