(function () {
    'use strict';

    // define factory
    angular.module('common').factory('logger',
        ['$log', 'config', logger]);

    // create factory
    function logger($log, config) {
        var service = {
            log: log,
            logError: logError,
            logSuccess: logSuccess,
            logWarning: logWarning
        };

        return service;

        // #region public members
        function log(message, data, source, showNotification) {
            writeLog(message, data, source, showNotification, "info");
        }

        function logError(message, data, source, showNotification) {
            writeLog(message, data, source, showNotification, "error");
        }

        function logSuccess(message, data, source, showNotification) {
            writeLog(message, data, source, showNotification, "success");
        }

        function logWarning(message, data, source, showNotification) {
            writeLog(message, data, source, showNotification, "warning");
        }
        // #endregion

        // #region private members
        // universal method for writing notifications
        function writeLog(message, data, source, showNotification, notificationType) {
            var iconUrl, notiTitle;
            showNotification = showNotification || true;

            // write to angular log, & specify error if it is an error
            var write = (notificationType === 'error') ? $log.error : $log.log;
            source = source ? '[' + source + '] ' : '';
            write(source, " ["+ moment().format('MMMM Do YYYY, h:mm:ss a') + "] ", message, data);

            //Add logic to show flyover message
        }
        // #endregion

    }
})();