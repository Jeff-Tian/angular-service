!function(){var n={},t={},e={};angular.module("serviceCacheCoreModule",[]).factory("cache",["$q",function(n){var t=e;return{get:function(e){var r=t[e];return r?n.resolve(r):n.reject()},set:function(e,r){return t[e]=r,n.resolve()},all:function(){return t}}}]).factory("api",["$http","cache","$q",function(e,r,c){var o={};return["get"].map(function(u){o[u]=function(o,i){return function(o,u,i){var f=o+"$"+u+"$"+(i?JSON.stringify(i):"");if("fetching"===n[f]){console.log("fetching"),t[f]||(t[f]=[]);var a=c.defer();return a.notify("fetching "+f),t[f].push(a),console.log(t),a.promise}return n[f]="fetching",r.get(f).then(function(n){return t[f]&&t[f].map(function(t){t.resolve(n)}),n}).catch(function(n){return e[o](u,i).then(function(n){return r.set(f,n),t[f]&&t[f].map(function(t){t.resolve(n)}),n}).catch(function(n){t[f]&&t[f].map(function(t){t.reject(n)})})}).finally(function(){delete n[f]})}(u,o,i)}}),["post","put","delete"].map(function(n){o[n]=e[n]}),o}])}();