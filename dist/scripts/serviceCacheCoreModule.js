!function(){var n={},e={},t={};angular.module("serviceCacheCoreModule",[]).factory("cache",["$q",function(n){var e=t;return{get:function(t){var r=e[t];return r?n.resolve(r):n.reject()},set:function(t,r){return e[t]=r,n.resolve()},all:function(){return e}}}]).factory("api",["$http","cache","$q",function(t,r,c){function o(o,u,i){var f=o+"$"+u+"$"+(i?JSON.stringify(i):"");if("fetching"===n[f]){console.log("fetching"),e[f]||(e[f]=[]);var a=c.defer();return a.notify("fetching "+f),e[f].push(a),console.log(e),a.promise}return n[f]="fetching",r.get(f).then(function(n){return e[f]&&e[f].map(function(e){e.resolve(n)}),n}).catch(function(n){return t[o](u,i).then(function(n){return r.set(f,n),e[f]&&e[f].map(function(e){e.resolve(n)}),n}).catch(function(n){e[f]&&e[f].map(function(e){e.reject(n)})})}).finally(function(){delete n[f]})}var u={};return["get","post","put","delete"].map(function(n){u[n]=function(e,t){return o(n,e,t)}}),u}])}();