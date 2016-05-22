/**
 * Created by kruna on 20/05/2016.
 */
(function () {
    'use strict';

    var controllerId = 'mySessionsCtrl';
    angular.module('MnS.BookingSystem').controller(controllerId,
        ['$rootScope', '$window', '$location','common', mySessionsController]);


    function mySessionsController($rootScope, $window, $location,common) {
        $rootScope.Title = "My Sessions";

        init();

        function init(){
            common.logger.log("controller loaded", null, controllerId);
            common.activateController([], controllerId);
        }
    }
    
})();