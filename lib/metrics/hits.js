// Hits
//
// Send back individual hits.  Warning: this will send
// a _lot_ of data if you have a high traffic site.

var Metric = require('../metric');

var hits = Object.create(Metric.prototype);

hits.name = 'hits';
hits.initialData = [];
hits.interval = 200; // ms
hits.increment = function(request) {
  this.data.push({
    url:       request.headers && request.headers.referer,
    timestamp: new Date(),
    ip:        request.ip
  });
};

module.exports = hits;
