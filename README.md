# angular-service
Wrap $http to handle service's 200 OK error response.
Wrap pagination data to handle pageState indicated pagination data.

# Contribution Notice:
Run `gulp` before making `git commit`. So the `dist` folder will be updated.

# Basic Usage
```
script(src="#{cdn.normal}bower_components/angular/angular.min.js?#{cdn.version}")
script(src="#{cdn.normal}bower_components/angular-service/dist/scripts/all.js?#{cdn.version}")

script.
    angular.module('yourModule', ['servicesModule'])
        .controller('yourCtrl', ['service', function(service){
            service.get('xxx', {}).then(success, fail);
        }])
    ;

```