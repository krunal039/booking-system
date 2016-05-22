/*
 */

(function () {
    'use strict';

    // define factory
    var serviceId = 'dataContext';
    angular.module('MnS.BookingSystem').factory(serviceId,
        ['$rootScope', '$cookieStore', '$http', '$q', 'config', 'common', 'CacheFactoryProvider', dataContext]);

    function dataContext($rootScope, $cookieStore, $http, $q, config, common, CacheFactoryProvider) {
        var service = this;
        var config = {
            sessionList: 'Sessions',
            bookingList: 'Session Booking',
            locationColumnCache: 'sessionBookingLocationDataCache',
            buColumnCache: 'sessionBookingBUDataCache',
            sessionsItemCache: 'sessionItemsDataCache'
        };
        service.config = config;
        // init factory
        init();

        self.sessionBookingLocation = CacheFactoryProvider.get(config.locationColumnCache);
        self.sessionBookingBU = CacheFactoryProvider.get(config.buColumnCache);
        self.sessionItems = CacheFactoryProvider.get(config.sessionsItemCache);

        self.sessionBookingLocation.setOptions({
            onExpire: function (key, value) {
                getActivityData()
                    .then(function () {
                        common.logger.log("Session Booking Location was automatically refreshed.", {}, serviceId);
                    }, function () {
                        common.logger.log("Session Booking Location : Error getting data. Putting expired item back in the cache.", {}, serviceId);
                        try {
                            self.activityDataCache.put(key, value);
                        } catch (err) {
                        }

                    });
            }
        });


        // service public signature
        return {
            getLocationChoices: getLocationChoices,
            getBusinessAreaChoices: getBusinessAreaChoices,
            // sessions path members
            getSessionItems: getSessionItems,
            getSessionItem: getSessionItem,
            // booking item members
            getMyBookingItems: getSessionBookingItems,
            getMyBookingItem: getSessionBookingItem,
            createMyBookingItem: createSessionBookingItem,
            saveMyBookingItem: saveSessionBookingItem,
            updateMyBookingItem: updateSessionBookingItem,
            deleteMyBookingItem: deleteSessionBookingItem,
            getCurrentUser : getCurrentUser
        };


        // init service
        function init() {
            common.logger.log("service loaded", null, serviceId);
            refreshSecurityValidation();
        }

        function getCurrentUser(){
            var deferred = $q.defer();
            $http.get('/_api/Web/CurrentUser')
                .then(function(response){
                        deferred.resolve(response);
                },
                function(error){
                    deferred.reject();
                })

            return deferred.promise;
        }

        // fire off automatic refresh of security digest
        function refreshSecurityValidation() {
            common.logger.log("refreshing security validation", service.securityValidation, serviceId);

            var siteContextInfoResource = $resource('_api/contextinfo?$select=FormDigestValue', {}, {
                post: {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json;odata=verbose;',
                        'Content-Type': 'application/json;odata=verbose;'
                    }
                }
            });

            // request validation
            siteContextInfoResource.post({}, function (data) {
                // obtain security digest timeout & value & store in service
                var validationRefreshTimeout = data.d.GetContextWebInformation.FormDigestTimeoutSeconds - 10;
                service.securityValidation = data.d.GetContextWebInformation.FormDigestValue;
                common.logger.log("refreshed security validation", service.securityValidation, serviceId);
                common.logger.log("next refresh of security validation: " + validationRefreshTimeout + " seconds", null, serviceId);

                // repeat this in FormDigestTimeoutSeconds-10
                $timeout(function () {
                    refreshSecurityValidation();
                }, validationRefreshTimeout * 1000);
            }, function (error) {
                common.logger.logError("response from contextinfo", error, serviceId);
            });


        }

        // get resourse to get learning item types available
        function getLocationChoicesResource() {
            return $resource('_api/web/lists/getbytitle(\'' + service.config.bookingList + '\')/Fields/getbytitle(\'Employee Location\')',
                {},
                {
                    get: {
                        method: 'GET',
                        params: {
                            '$select': 'Choices'
                        },
                        headers: {
                            'Accept': 'application/json;odata=verbose;'
                        }
                    }
                });
        }

        function getBusinessChoicesResource() {
            return $resource('_api/web/lists/getbytitle(\'' + service.config.bookingList + '\')/Fields/getbytitle(\'Employee Business Area\')',
                {},
                {
                    get: {
                        method: 'GET',
                        params: {
                            '$select': 'Choices',
                            '$filter': 'InternalName eq \'ItemType\'',
                            '$orderBy': 'Choices',
                            '$top': 5000

                        },
                        headers: {
                            'Accept': 'application/json;odata=verbose;'
                        }
                    }
                });
        }

        // get the Learning Path angular resource reference
        function getSessionItemsResource() {
            //   THEN build the resource to the specific item
            return $resource('_api/web/lists/getbytitle(\'' + service.config.sessionList + '\')/items',
                {},
                {
                    get: {
                        method: 'GET',
                        params: {
                            '$select': 'Id,SessionTitle,SessionDescription,SessionLocation,SessionStartDate,SessionsEndDate,SessionSeats',
                            '$filter': 'SessionStatus eq \'Open\'',
                            '$orderBy': 'SessionTitle',
                            '$top': 5000
                        },
                        headers: {
                            'Accept': 'application/json;odata=verbose;'
                        }
                    }
                });
        }

        // get the Learning Path angular resource reference
        function getSessionItemResource(currentItem) {
            // if an ID is passed in,
            //   ELSE create resource pointing to collection for a new item
            if (+currentItem.Id) {
                //   THEN build the resource to the specific item
                return $resource('_api/web/lists/getbytitle(\'' + service.config.sessionList + '\')/items(:itemId)',
                    {itemId: currentItem.Id},
                    {
                        get: {
                            method: 'GET',
                            params: {
                                '$select': 'Id,SessionTitle,SessionDescription,SessionLocation,SessionStartDate,SessionEndDate,SessionSeats',
                                '$top': 5000
                            },
                            headers: {
                                'Accept': 'application/json;odata=verbose;'
                            }
                        },
                        post: {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json;odata=verbose;',
                                'Content-Type': 'application/json;odata=verbose;',
                                'X-RequestDigest': service.securityValidation,
                                'X-HTTP-Method': 'MERGE',
                                'If-Match': currentItem.__metadata.etag
                            }
                        },
                        delete: {
                            method: 'DELETE',
                            headers: {
                                'Accept': 'application/json;odata=verbose;',
                                'Content-Type': 'application/json;odata=verbose;',
                                'X-RequestDigest': service.securityValidation,
                                'If-Match': '*'
                            }
                        }
                    });
            } else {
                return $resource('_api/web/lists/getbytitle(\'' + service.config.sessionList + '\')/items',
                    {},
                    {
                        post: {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json;odata=verbose;',
                                'Content-Type': 'application/json;odata=verbose;',
                                'X-RequestDigest': service.securityValidation
                            }
                        }
                    });
            }
        }

        function getBookingItemsResource() {
            //   THEN build the resource to the specific item
            return $resource('_api/web/lists/getbytitle(\'' + service.config.bookingList + '\')/items',
                {},
                {
                    get: {
                        method: 'GET',
                        params: {
                            '$select': 'Id,SessionId,EmployeeLocation,EmployeeBusinessArea,SessionBookingStatus,Author/ID,Author/FirstName,Author/LastName,Author/Title',
                            '$filter': 'SessionId eq ' + sessionIdFilter + ' AND AuthorId eq ' + window._spPageContextInfo.userId,
                            '$expand' : 'Author/ID',
                            '$orderBy': 'SessionId',
                        },
                        headers: {
                            'Accept': 'application/json;odata=verbose;'
                        }
                    }
                });
        }


        // get the Learning Item angular resource reference
        function getBookingItemResource(currentItem, sessionIdFilter) {
            // if a  item is passed in...
            if (currentItem) {
                //  THEN if the item has an ID
                if (+currentItem.Id) {
                    //  THEN get the specific item
                    return $resource('_api/web/lists/getbytitle(\'' + service.config.bookingList + '\')/items(:itemId)',
                        {itemId: currentItem.Id},
                        {
                            get: {
                                method: 'GET',
                                params: {
                                    '$select': 'Id,SessionId,EmployeeLocation,EmployeeBusinessArea,SessionBookingStatus,Author/ID,Author/FirstName,Author/LastName,Author/Title',
                                    '$expand' : 'Author/ID'
                                },
                                headers: {
                                    'Accept': 'application/json;odata=verbose'
                                }
                            },
                            post: {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json;odata=verbose;',
                                    'Content-Type': 'application/json;odata=verbose;',
                                    'X-RequestDigest': spContext.securityValidation,
                                    'X-HTTP-Method': 'MERGE',
                                    'If-Match': currentItem.__metadata.etag
                                }
                            },
                            delete: {
                                method: 'DELETE',
                                headers: {
                                    'Accept': 'application/json;odata=verbose;',
                                    'Content-Type': 'application/json;odata=verbose;',
                                    'X-RequestDigest': service.securityValidation,
                                    'If-Match': '*'
                                }
                            },
                            update: {
                                method: 'PUT',
                                headers: {
                                    'Accept': 'application/json;odata=verbose;',
                                    'Content-Type': 'application/json;odata=verbose;',
                                    'X-RequestDigest': service.securityValidation,
                                    'If-Match': '*'
                                }
                            }
                        });
                } else {
                    //  ELSE creating item...
                    return $resource('_api/web/lists/getbytitle(\'' + service.config.bookingList + '\')/items',
                        {},
                        {
                            post: {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json;odata=verbose',
                                    'Content-Type': 'application/json;odata=verbose;',
                                    'X-RequestDigest': service.securityValidation
                                }
                            }
                        });
                }
            } else {
                // ELSE if an booking ID filter is passed in,
                if (sessionIdFilter) {
                    //   THEN build the resource filtering for a specific session item
                    //   ELSE create resource showing all items
                    return $resource('_api/web/lists/getbytitle(\'' + service.config.bookingList + '\')/items',
                        {},
                        {
                            get: {
                                method: 'GET',
                                params: {
                                    '$select': 'Id,SessionId,EmployeeLocation,EmployeeBusinessArea,SessionBookingStatus,Author/ID,Author/FirstName,Author/LastName,Author/Title',
                                    '$filter': 'SessionId eq ' + sessionIdFilter + ' AND AuthorId eq ' + window._spPageContextInfo.userId,
                                    '$expand' : 'Author/ID'
                                },
                                headers: {
                                    'Accept': 'application/json;odata=verbose;'
                                }
                            },
                        });
                } else {
                    return $resource('_api/web/lists/getbytitle(\'' + service.config.bookingList + '\')/items',
                        {},
                        {
                            get: {
                                method: 'GET',
                                params: {
                                    '$select': 'Id,SessionId,EmployeeLocation,EmployeeBusinessArea,SessionBookingStatus,Author/ID,Author/FirstName,Author/LastName,Author/Title',
                                    '$filter': 'AuthorId eq ' + window._spPageContextInfo.userId,
                                    '$expand' : 'Author/ID'
                                },
                                headers: {
                                    'Accept': 'application/json;odata=verbose;'
                                }
                            }
                        });
                }
            }
        }


        // get all item choices available
        function getLocationChoices() {

            var deferred = $q.defer(),
                locationData = self.activityDataCache.get(config.locationColumnCache);
            if (locationData) {
                common.logger.log("Found Activity data inside cache ", locationData, serviceId);
                deferred.resolve(locationData);
            } else {
                var resource = getLocationChoicesResource();
                resource.get({}, function (data) {
                    deferred.resolve(data.d.results[0].Choices.results);
                    common.logger.log("retrieved Location field choices", data, serviceId);
                }, function (error) {
                    deferred.reject(error);
                    common.logger.logError("retrieved Location field choices", error, serviceId);
                });
            }


            return deferred.promise;
        }

        function getBusinessAreaChoices() {


            var deferred = $q.defer(),
                buData = self.activityDataCache.get(config.buColumnCache);
            if (locationData) {
                common.logger.log("Found Activity data inside cache ", buData, serviceId);
                deferred.resolve(buData);
            } else {
                var resource = getBusinessChoicesResource();
                resource.get({}, function (data) {
                    deferred.resolve(data.d.results[0].Choices.results);
                    common.logger.log("retrieved Business Area field choices", data, serviceId);
                }, function (error) {
                    deferred.reject(error);
                    common.logger.logError("retrieved Business Area field choices", error, serviceId);
                });
            }

            return deferred.promise;
        }

        // get all sessions Items
        function getSessionItems() {

            var deferred = $q.defer(),
                sessionsData = self.activityDataCache.get(config.sessionsItemCache);
            if (locationData) {
                common.logger.log("Found Activity data inside cache ", sessionsData, serviceId);
                deferred.resolve(buData);
            } else {
                // get resource
                var resource = getSessionItemsResource();
                resource.get({}, function (data) {
                    deferred.resolve(data.d.results);
                    common.logger.log("retrieved learning path id", data, serviceId);
                }, function (error) {
                    deferred.reject(error);
                    common.logger.logError("retrieve learning path id", error, serviceId);
                });
            }
            return deferred.promise;
        }

        // gets a specific session
        function getSessionItem(id) {

            var deferred = $q.defer(),
                sessionsData = self.activityDataCache.get(config.sessionsItemCache);
            if (locationData) {
                common.logger.log("Found Activity data inside cache ", sessionsData, serviceId);
                deferred.resolve(_.where(sessionsData.d.results, {Id: id}));
            } else {

                var si = new mnsbs.models.Session();
                si.Id = id;

                // get resource
                var resource = getSessionItemResource(si);

                resource.get({}, function (data) {
                    deferred.resolve(data.d);
                    common.logger.log("retrieved session by id", data, serviceId);
                }, function (error) {
                    deferred.reject(error);
                    common.logger.logError("retrieve session by id", error, serviceId);
                });
            }
            return deferred.promise;
        }


        // retrieve all session booking for session, using ngHttp service
        function getSessionBookingItems(sessionIdFilter) {
            // get resource
            var resource = getBookingItemsResource(null, sessionIdFilter);

            var deferred = $q.defer();
            resource.get({}, function (data) {
                deferred.resolve(data.d.results);
                common.logger.log("retrieved booking for session", data, serviceId);
            }, function (error) {
                deferred.reject(error);
                common.logger.logError("retrieved booking for session", error, serviceId);
            });

            return deferred.promise;
        }

        // gets a specific session booking item
        function getSessionBookingItem(id) {
            var sb = new mnsbs.models.SessionBooking();
            sb.Id = id;

            // get resource
            var resource = getBookingItemResource(sb);

            var deferred = $q.defer();
            resource.get({}, function (data) {
                deferred.resolve(data.d);
                common.logger.log("retrieved booking item", data, serviceId);
            }, function (error) {
                deferred.reject(error);
                common.logger.logError("retrieve booking item", error, serviceId);
            });

            return deferred.promise;
        }

        // creates a new session booking item
        function createSessionBookingItem() {
            return new mnsbs.models.SessionBooking();
        }

        // saves a session booking item
        function saveSessionBookingItem(item) {
            // get resource
            var resource = getBookingItemResource(item);

            // create save object
            var saveItem = new mnsbs.models.SessionBooking();
            saveItem.SessionId = item.SessionId;
            saveItem.EmployeeLocation = item.EmployeeLocation;
            saveItem.EmployeeBusinessArea = item.EmployeeBusinessArea;
            saveItem.SessionBookingStatus = item.SessionBookingStatus;

            var deferred = $q.defer();

            resource.post(saveItem, function (data) {
                deferred.resolve(data);
                common.logger.log("save session booking item", data, serviceId);
            }, function (error) {
                deferred.reject(error);
                common.logger.logError("Save session booking item", error, serviceId);
            });

            return deferred.promise;

        }

        // deletes a session booking item
        function deleteSessionBookingItem(item) {
            // get resource
            var resource = getBookingItemResource(item);

            var deferred = $q.defer();

            // use angular $resource to delete the item
            resource.delete(item, function (data) {
                deferred.resolve(data);
                common.logger.log("delete session booking item", data, serviceId);
            }, function (error) {
                deferred.reject(error);
                common.logger.logError("delete session booking item", error, serviceId);
            });

            return deferred.promise;
        }

        function updateSessionBookingItem(item) {
            var resource = getBookingItemResource(item);

            // create save object
            var saveItem = new mnsbs.models.SessionBooking();
            saveItem.SessionId = item.SessionId;
            saveItem.EmployeeLocation = item.EmployeeLocation;
            saveItem.EmployeeBusinessArea = item.EmployeeBusinessArea;
            saveItem.SessionBookingStatus = item.SessionBookingStatus;

            var deferred = $q.defer();

            resource.update(saveItem, function (data) {
                deferred.resolve(data);
                common.logger.log("save session booking item", data, serviceId);
            }, function (error) {
                deferred.reject(error);
                common.logger.logError("Save session booking item", error, serviceId);
            });

            return deferred.promise;
        }
    }
})();