angular.module("servicesModule").factory("paginationData",["service",function(t){function e(t,e){if(this.records=[],this.pageState=null,this.pageIndex=-1,this.fetching=!1,this.dataField="data",this.dataMapping=function(t){return t},"object"==typeof t&&1===arguments.length){var a=t;this.sourceUrl=a.sourceUrl,this.queryData=a.queryData,this.dataField=a.dataField||this.dataField,this.dataMapping=a.dataMapping||this.dataMapping}else this.sourceUrl=t,this.queryData=e}return e.prototype.getNextPage=function(e){if(this.pageIndex<this.records.length-1)this.pageIndex++;else{var a=this;t.executePromiseAvoidDuplicate(this,"fetching",function(){return t.post(a.sourceUrl,angular.extend({},a.queryData,e,{pageState:a.pageState})).then(function(t){t[a.dataField]&&(a.pageIndex++,a.records.push(a.dataMapping(t[a.dataField]))),a.pageState=t.pageState})})}},e.prototype.getPrevPage=function(){this.pageIndex--},e.prototype.getPages=function(){return new Array(this.records.length)},e}]);