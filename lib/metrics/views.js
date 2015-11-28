// Views
//
// Emits aggregates per interval for the number of requests
// with a query parameter ?event=view

var Metric = require('../metric');

var views = Object.create(Metric.prototype);

views.name = 'cart_adds';
views.initialData = 0;
views.interval = 50; // ms
views.increment = function(request) {
  if(request.params.event === "view") {
    this.data += 1;
  }
};

module.exports = views;
