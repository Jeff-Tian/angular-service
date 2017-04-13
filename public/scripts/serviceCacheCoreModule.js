;
(function () {
    var apiStatus = {};
    var apiQueue = {};
    var inMemoryCache = {};

    angular.module('serviceCacheCoreModule', [])
        .factory('cache', ['$q', function ($q) {
            // TODO: Add local storage cache
            var cache = inMemoryCache;

            return {
                get: function (key) {
                    var result = cache[key];

                    if (result) {
                        return $q.resolve(result);
                    } else {
                        return $q.reject();
                    }
                },

                set: function (key, value) {
                    cache[key] = value;
                    return $q.resolve();
                },

                all: function () {
                    return cache;
                }
            };
        }])
        .factory('api', ['$http', 'cache', '$q', function ($http, cache, $q) {
            function getApiResult(method, url, data) {
                var key = method + '$' + url + '$' + (data ? JSON.stringify(data) : '');

                if (apiStatus[key] === 'fetching') {
                    console.log('fetching');
                    if (!apiQueue[key]) {
                        apiQueue[key] = [];
                    }

                    var notify = $q.defer();
                    notify.notify('fetching ' + key);
                    apiQueue[key].push(notify);
                    console.log(apiQueue);
                    return notify.promise;
                }

                apiStatus[key] = 'fetching';

                return cache.get(key)
                    .then(function (result) {
                        if (apiQueue[key]) {
                            apiQueue[key].map(function (n) {
                                n.resolve(result);
                            });
                        }

                        return result;
                    })
                    .catch(function (ex) {
                        return $http[method](url, data).then(function (result) {
                            cache.set(key, result);

                            if (apiQueue[key]) {
                                apiQueue[key].map(function (n) {
                                    n.resolve(result);
                                });
                            }

                            return result;
                        }).catch(function (ex) {
                            if (apiQueue[key]) {
                                apiQueue[key].map(function (n) {
                                    n.reject(ex);
                                });
                            }
                        });
                    })
                    .finally(function () {
                        delete apiStatus[key];
                    })
                    ;
            }

            var api = {};

            ['get'].map(function (m) {
                api[m] = function (url, data) {
                    return getApiResult(m, url, data);
                };
            });

            ['post', 'put', 'delete'].map(function (m) {
                api[m] = $http[m];
            });

            return api;
        }])
    ;
})();