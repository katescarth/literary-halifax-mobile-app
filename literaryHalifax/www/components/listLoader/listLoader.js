angular.module('literaryHalifax').directive('listLoader', function () {
    return {
        scope: {
            loadingMsg: '=',
            errorMsg: '='
        }
        , templateUrl: 'components/listLoader/listLoader.html'
    }
})