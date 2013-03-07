// Total views
//
// Sends total count per interval of time for every
// request made

var Metric = require('../metric');

var totalsBy10Second = Object.create(Metric.prototype);

totalsBy10Second.name = 'totals_by_10sec';
totalsBy10Second.initialData = 0;
totalsBy10Second.interval = 10 * 1000; // 10 seconds
totalsBy10Second.increment = function(request) {
  this.data += 1;
};

module.exports = totalsBy10Second;
