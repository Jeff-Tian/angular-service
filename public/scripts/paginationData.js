angular.module('servicesModule')
    .factory('paginationData', ['service', function (service) {
        function paginationData(sourceUrl, queryData, dataField, dataMapping) {
            this.records = [];
            this.pageState = null;
            this.pageIndex = -1;
            this.sourceUrl = sourceUrl;
            this.queryData = queryData;
            this.fetching = false;
            this.dataField = dataField || 'data';
            this.dataMapping = dataMapping || function (data) {
                    return data;
                };
        }

        paginationData.prototype.getNextPage = function (data) {
            if (this.pageIndex < (this.records.length - 1)) {
                this.pageIndex++;
            } else {
                var self = this;
                service.executePromiseAvoidDuplicate(this, 'fetching', function () {
                    return service
                        .post(self.sourceUrl, angular.extend({}, self.queryData, data, {
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