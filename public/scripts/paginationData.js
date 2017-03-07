angular.module('servicesModule')
    .factory('httpPaginationData', ['$http', '$q', function ($http, $q) {
        function paginationData(sourceUrl, queryData, settings) {
            this.records = [];
            this.pageState = null;
            this.pageIndex = -1;
            this.fetching = false;

            this.dataField = 'data';
            this.dataMapping = function (data) {
                return data;
            };

            this.method = 'get';

            if (typeof sourceUrl === 'object' && arguments.length === 1) {
                var options = sourceUrl;

                this.sourceUrl = options.sourceUrl;
                this.queryData = options.queryData;

                this.dataField = options.dataField || this.dataField;
                this.dataMapping = options.dataMapping || this.dataMapping;
                this.pageSize = options.pageSize;
                this.dataGotCallback = options.dataGotCallback;
            } else {
                this.sourceUrl = sourceUrl;
                this.queryData = queryData;
                this.pageSize = queryData.pageSize;
                this.dataGotCallback = settings.dataGotCallback;
            }

            console.log('data got callback = ', this.dataGotCallback);
            console.log('typeof callback = ', typeof this.dataGotCallback);
        }

        function getNextPageFromServer(context, data) {
            var pageData = angular.extend({}, context.queryData, {
                pageState: context.pageState,
                pageSize: context.pageSize
            }, data);

            if (context.method === 'get') {
                pageData = {
                    params: pageData
                };
            }

            return $http[context.method](context.sourceUrl, pageData).then(function (result) {
                result = result.data;

                if (result[context.dataField]) {
                    context.pageIndex++;
                    context.records.push(context.dataMapping(result[context.dataField]));
                }

                if (result.pageState !== context.pageState) {
                    context.pageState = result.pageState;
                } else {
                    context.pageState = null;
                }

                return result;
            });
        }

        function getNextPageFromCache(context) {
            context.pageIndex++;

            return $q.resolve(context.records[context.pageIndex]);
        }

        function getNextPage(context, data) {
            if (context.pageIndex < (context.records.length - 1)) {
                return getNextPageFromCache(context);
            } else {
                return getNextPageFromServer(context, data);
            }
        }

        paginationData.prototype.getNextPage = function (data) {
            return getNextPage(this, data).then(function (result) {
                if (typeof this.dataGotCallback === 'function') {
                    this.dataGotCallback(result);
                }

                return result;
            });
        };

        paginationData.prototype.getPrevPage = function () {
            this.pageIndex--;
        };

        paginationData.prototype.getPages = function () {
            return new Array(this.records.length);
        };

        return paginationData;
    }])
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

                            return result;
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

        paginationData.prototype.getTotalRecords = function () {
            var sum = 0;

            for (var i = 0; i < this.records.length; i++) {
                sum += this.records[i].length;
            }

            return sum;
        };

        return paginationData;
    }])
;