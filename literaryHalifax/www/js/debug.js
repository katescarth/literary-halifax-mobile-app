/*global angular */
/*global console */

var decorate = function (module) {
    (function (orig) {
        
        module.factory = function () {
            if (arguments.length > 1) {
                console.log(arguments[0]);
            }
            return orig.apply(null, arguments);
        }
        
    }(module.factory));
    (function (orig) {
        
        module.service = function () {
            if (arguments.length > 1) {
                console.log(arguments[0]);
            }
            return orig.apply(null, arguments);
        }
        
    }(module.service));
    return module;
};


(function (orig) {
    "use strict";
    angular.modules = [];
    angular.module = function () {
        if (arguments.length > 1) {
        }
        return decorate(orig.apply(null, arguments));
    };
})(angular.module);


