/**
 * Created by kruna on 20/05/2016.
 */
(function () {
    'use strict';

    var controllerId = 'sessionCtrl';
    angular.module('MnS.BookingSystem').controller(controllerId,
        ['$rootScope','$http', '$q', '$window', '$location', 'common', sessionController]);


    function sessionController($rootScope, $http, $q, $window, $location, common) {
        var vm = this;
        vm.submitDate = submitDate;

        $rootScope.Title = "Session";

        init();

        function init() {
            common.logger.log("controller loaded", null, controllerId);
            common.activateController([], controllerId);
            getLocations();
            getBusinessUnit();
            getSessionById(1);
        }

        function isBookingAllowed(){
            var currentSessionAllowedCount =  vm.session.SessionSeats;
            var deferred = $q.defer();
            $http.get('stubs/sessionbooking.json')
                .then(function successCallback(response) {
                    deferred.resolve(currentSessionAllowedCount > response.data.d.results.length ? false : true);

                }, function errorCallback(response) {
                    deferred.reject(false);
                });
            return deferred.promise;
        }

        function getSessionById(id){
            $http.get('stubs/session.json')
                .then(function successCallback(response) {
                    vm.session = response.data.d;

                }, function errorCallback(response) {

                });
        }

        function submitDate(){

        }

        function getLocations(){
            $http.get('stubs/location.json')
                .then(function successCallback(response) {
                    vm.locations = response.data.d.Choices.results;

                }, function errorCallback(response) {

                });
        }

        function getBusinessUnit(){
            $http.get('stubs/bu.json')
                .then(function successCallback(response) {
                    vm.bu = response.data.d.Choices.results;

                }, function errorCallback(response) {

                });
        }
    }

    $(document).ready(function(){
        $( document.body ).on( 'click', '.dropdown-menu li', function( event ) {

            var $target = $( event.currentTarget );

            $target.closest( '.btn-group' )
                .find( '[data-bind="label"]' ).text( $target.text() )
                .end()
                .children( '.dropdown-toggle' ).dropdown( 'toggle' );

            return false;

        });
    })

})();
