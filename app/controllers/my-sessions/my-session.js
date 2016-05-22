/**
 * Created by kruna on 20/05/2016.
 */
(function () {
    'use strict';

    var controllerId = 'mySessionCtrl';
    angular.module('MnS.BookingSystem').controller(controllerId,
        ['$rootScope', '$window', '$location','common', mySessionController]);


    function mySessionController($rootScope, $window, $location,common) {
        $rootScope.Title = "My Session";

        init();

        function init(){
            common.logger.log("controller loaded", null, controllerId);
            common.activateController([], controllerId);
        }
    }
    
})();