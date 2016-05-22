(function () {
    'use strict';

    var app = angular.module('MnS.BookingSystem');

    // get all the routes
    app.constant('routes', getRoutes());

    // config routes & their resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);

    function routeConfigurator($routeProvider, routes) {
        routes.forEach(function (route) {
            $routeProvider.when(route.url, route.config);
        });

        $routeProvider.otherwise({redirectTo: '/sessions'});
    }

    // build the routes
    function getRoutes() {
        return [
            {
                url: '/sessions',
                config: {
                    templateUrl: 'controllers/sessions/sessions.html',
                    title: 'Sessions',
                    settings: {
                        nav: 1,
                        content: 'Sessions',
                        quickLaunchEnabled: true
                    }
                }
            },
            {
                url: '/sessions/:id',
                config: {
                    templateUrl: 'controllers/sessions/session.html',
                    title: 'Sessions',
                    settings: {
                        nav: 1.1,
                        content: 'Sessions',
                        quickLaunchEnabled: false
                    }
                }
            },
            {
                url: '/my-sessions',
                config: {
                    templateUrl: 'controllers/my-sessions/my-sessions.html',
                    title: 'My Sessions',
                    settings: {
                        nav: 2,
                        content: 'My Session',
                        quickLaunchEnabled: true
                    }
                }
            },
            {
                url: '/my-sessions/:id',
                config: {
                    templateUrl: 'controllers/my-sessions/my-session.html',
                    title: 'My Sessions',
                    settings: {
                        nav: 2.1,
                        content: 'My Sessions',
                        quickLaunchEnabled: false
                    }
                }
            }
        ];
    }
})();