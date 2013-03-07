// Total views
//
// Sends total count per interval of time for every
// request made

var Metric = require('../metric');

var totalsBy10Minute = Object.create(Metric.prototype);

totalsBy10Minute.name = 'totals_by_10min';
totalsBy10Minute.initialData = 0;
totalsBy10Minute.interval = 10 * 60 * 1000; // 10 minutes
totalsBy10Minute.increment = function(request) {
  this.data += 1;
};

module.exports = totalsBy10Minute;
