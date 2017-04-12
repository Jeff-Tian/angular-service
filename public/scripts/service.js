var url = {
    parse: function (url) {
        var l = document.createElement('a');
        l.href = url;
        return l;
    }
};

var scripts = document.getElementsByTagName('script');
var path = scripts[scripts.length - 1].src.split('?')[0];      // remove any ?query
var mydir = path.split('/').slice(0, -1).join('/') + '/';  // remove last filename part of path
var scriptLocation = url.parse(mydir);

/**
 * A $http wrapper that dedicate to pre handle the return data by service api. For example, check the
 * isSuccess and invoke the successCallback and errorCallback accordingly.
 *
 * Without it, you have to write code like this:
 *      $http.get(url)
 *          .success(function(res){
     *              if(res.isSuccess) {
     *                  successCallback(res.result);
     *              } else {
     *                  errorCallback(res.message);
     *              }
     *          }).error(function(res){
     *              errorCallback(res.message);
     *          })
 *      ;
 *
 * With service, you can simplify the above code to:
 *      $service.get(url)
 *          .then(successCallback)
 *          .catch(errorCallback)
 *      ;
 *
 * For each method provided by $http, service has one with the same name:
 *      $http.get       --> service.get
 *      $http.post      --> service.post
 *      $http.delete    --> service.delete
 *      ...
 *
 * @param $http
 * @param $q
 * @returns {{}}
 */
angular.module('servicesModule')
    .factory('service', ['api', '$q', function ($http, $q) {
        function handleHttpPromise(httpPromise) {
            var dfd = $q.defer();

            httpPromise
                .then(function (res) {
                    res = res.data;

                    if (res.isSuccess) {
                        dfd.resolve(res.result || res.results);
                    } else {
                        console.error(res);
                        console.error(httpPromise.value);

                        if (typeof res.code !== 'undefined') {
                            dfd.reject(res);

                            if (String(res.code) === '302') {
                                window.location.href = res.message;
                            }
                        } else {
                            dfd.reject(res.message || '服务器返回错误的数据');
                        }
                    }
                }, function (reason) {
                    reason = reason.data;

                    dfd.reject(reason);

                    if (reason && reason.code && String(reason.code) === '401' && window.location.pathname !== '/sign-in') {
                        window.location.href = '/sign-in?return_url=' + encodeURIComponent(window.location.href);
                    }
                })
            ;

            return dfd.promise;
        }

        var s = {};

        // Inherits $http to s
        for (var method in $http) {
            if ($http.hasOwnProperty(method) && typeof $http[method] === 'function') {
                s[method] = (function (m) {
                    return function () {
                        return handleHttpPromise($http[m].apply(this, Array.prototype.slice.call(arguments)));
                    };
                })(method);   // jshint ignore:line
            }
        }

        // s' own methods
        s.executePromiseAvoidDuplicate = function (scope, flag, promise) {
            var dfd = $q.defer();

            if (scope[flag]) {
                dfd.reject('submitting...');

                return dfd;
            }

            scope[flag] = true;
            return promise().finally(function () {
                scope[flag] = false;
            });
        };

        s.postSync = function (url) {
            var worker = new Worker(mydir + 'syncRequest.js');
            worker.onmessage = function (event) {
                console.log(event);
                alert(event.data);
            };

            worker.postMessage('POST');
        };

        // s' own properties

        return s;
    }])
;