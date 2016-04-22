angular.module('servicesModule')
    .factory('paginationData', ['service', function (service) {
        function paginationData(sourceUrl, queryData) {
            this.records = [];
            this.pageState = null;
            this.pageIndex = -1;
            this.fetching = false;

            this.dataField = 'data';
            this.dataMapping = function (data) {
                return data;
            };
            this.httpMethod = 'post';

            if (typeof sourceUrl === 'object' && arguments.length === 1) {
                var options = sourceUrl;

                this.sourceUrl = options.sourceUrl;
                this.queryData = options.queryData;

                this.dataField = options.dataField || this.dataField;
                this.dataMapping = options.dataMapping || this.dataMapping;
                this.httpMethod = options.httpMethod || this.httpMethod;
            } else {
                this.sourceUrl = sourceUrl;
                this.queryData = queryData;
            }
        }

        paginationData.prototype.getNextPage = function (data) {
            if (this.pageIndex < (this.records.length - 1)) {
                this.pageIndex++;
            } else {
                var self = this;
                service.executePromiseAvoidDuplicate(this, 'fetching', function () {
                    return service[this.httpMethod](self.sourceUrl, angular.extend({}, self.queryData, data, {
                        pageState: self.pageState
                    }))
                        .then(function (result) {
                            if (result[this.dataField]) {
                                self.pageIndex++;
                                self.records.push(this.dataMapping(result.data));
                            }

                            self.pageState = result.pageState;
                        })
                        ;
                });
            }
        };

        paginationData.prototype.getPrevPage = function () {
            this.pageIndex--;
        };

        paginationData.prototype.getPages = function () {
            return new Array(this.records.length);
        };

        return paginationData;
    }])
;