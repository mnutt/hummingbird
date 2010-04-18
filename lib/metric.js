var sys = require('sys');

var Metric = function(initialData, interval) {
  if(!this instanceof Metric) {
    return new Metric(initialData, interval);
  }

  this.initialData = this.data = initialData;
  this.interval = interval;
  this.job = null;
  this.clients = [];
}

Metric.prototype = {
  run: function() {
    this.job = setInterval(this.runner, this.interval, this);
  },

  runner: function(metric) {
    // sys.log(JSON.stringify(metric.data));
    // NOTE: using 'metric' in place of 'this', since run from setInterval
    metric.clients.each(function(client) {
      try {
        client.write(JSON.stringify(metric.data));
      } catch(e) {
        sys.log(e.description);
      }
    });

    metric.resetData();
  },

  removeClient: function(client) {
    this.clients.remove(client);
  },

  addClient: function(client) {
    this.clients.push(client);
  },

  resetData: function() {
    this.data = JSON.parse(JSON.stringify(this.initialData));
  },

  stop: function() {
    clearInterval(this.job);
  }
};

exports.Metric = Metric;