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

            if (typeof sourceUrl === 'object' && arguments.length === 1) {
                var options = sourceUrl;

                this.sourceUrl = options.sourceUrl;
                this.queryData = options.queryData;

                this.dataField = options.dataField || this.dataField;
                this.dataMapping = options.dataMapping || this.dataMapping;
                this.pageSize = options.pageSize;
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
                    return service.post(self.sourceUrl, angular.extend({}, self.queryData, {
                        pageState: self.pageState,
                        pageSize: self.pageSize
                    }, data))
                        .then(function (result) {
                            if (result[self.dataField]) {
                                self.pageIndex++;
                                self.records.push(self.dataMapping(result[self.dataField]));
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
    .factory('paginationDataWithTotal', ['service', function (service) {
        function paginationData(sourceUrl, queryData) {
            this.records = [];
            this.pageIndex = -1;
            this.fetching = false;

            this.dataField = 'data';
            this.totalField = 'total';
            this.dataMapping = function (data) {
                return data;
            };

            if (typeof sourceUrl === 'object' && arguments.length === 1) {
                var options = sourceUrl;

                this.sourceUrl = options.sourceUrl;
                this.queryData = options.queryData;

                this.dataField = options.dataField || this.dataField;
                this.dataMapping = options.dataMapping || this.dataMapping;
                this.pageSize = options.pageSize;
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
                    return service.post(self.sourceUrl, angular.extend({}, self.queryData, {
                        offset: self.pageSize * (self.pageIndex + 1),
                        pageSize: self.pageSize
                    }, data))
                        .then(function (result) {
                            if (result[self.dataField]) {
                                self.pageIndex++;
                                self.records.push(self.dataMapping(result[self.dataField]));
                            }

                            if (result[self.totalField]) {
                                self.total = result[self.totalField];
                            }
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