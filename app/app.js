(function () {
    'use strict';

    // create app
    var app = angular.module('MnS.BookingSystem', [
        // ootb angular modules
        'ngRoute',      // app route (url path) support
        'ngCookies',    // cookie read/write support
        'ngSanitize',   // fixes HTML issues in data binding
        'ngResource',   // assists with rest calls
        'ngAnimate',    // animation capabilities
        'angular-cache', //angular cache
        // my custom modules
        'common'
    ]);

    // startup code
    app.run(['$route','angular.config', function($route, angularConfig) {

    }]);

    app.config(['$routeProvider','CacheFactoryProvider', function ($routeProvider, CacheFactoryProvider) {
        $routeProvider.otherwise({redirectTo: '/sessions'});
        angular.extend(CacheFactoryProvider.defaults, { storageMode: "localStorage", maxAge: 720000, deleteOnExpire: "aggressive" });
    }]);
})();