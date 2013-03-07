// Total views
//
// Sends total count per interval of time for every
// request made

var Metric = require('../metric');

var totalsByMinute = Object.create(Metric.prototype);

totalsByMinute.name = 'totals_by_minute';
totalsByMinute.initialData = 0;
totalsByMinute.interval = 60 * 1000; // 60 seconds
totalsByMinute.increment = function(request) {
  this.data += 1;
};

module.exports = totalsByMinute;
