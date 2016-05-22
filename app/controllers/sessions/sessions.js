/**
 * Created by kruna on 20/05/2016.
 */
(function () {
    'use strict';

    var controllerId = 'sessionsCtrl';
    angular.module('MnS.BookingSystem').controller(controllerId,
        ['$rootScope', '$http', '$q', '$window', '$location', 'common', sessionsController]);


    function sessionsController($rootScope, $http, $q, window, $location, common) {
        var vm = this;
        vm.routeToSessionBooking = routeToSessionBooking;
        vm.isBookingAllowed = isBookingAllowed;
        vm.sessions = [];
        $rootScope.Title = "All Sessions";
        init();

        function init() {
            common.logger.log("controller loaded", null, controllerId);
            common.activateController([], controllerId);
            getSessions();
        }

        function getSessions() {
            vm.sessions = [];
            $http.get('stubs/sessions.json')
                .then(function successCallback(response0) {

                    $.each(response0.data.d.results, function( index, value ) {
                        $http.get('stubs/sessionbooking.json')
                            .then(function successCallback(response) {
                                value.isBookingAllowed =  (value.SessionSeats > response.data.d.results.length? false : true);
                                vm.sessions.push(value);

                            }, function errorCallback(response) {
                                value.isBookingAllowed = (false);
                                vm.sessions.push(value);
                            });
                    });
                }, function errorCallback(response) {

                });
        }

        function routeToSessionBooking(id){
            $location.path('/sessions/' + id);
        }

        function isBookingAllowed(sessionSeates, sessionId){
            $http.get('stubs/sessionbooking.json')
                .then(function successCallback(response) {
                    return (sessionSeates > response.data.d.results.length? false : true);

                }, function errorCallback(response) {
                    return (false);
                });
        }
    }

})();