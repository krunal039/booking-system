(function () {
    'use strict';
    angular.module('MnS.BookingSystem').filter('moment', function() {
        return function(dateString, format) {
            return moment(dateString).format(format);
        };
    });

})();
