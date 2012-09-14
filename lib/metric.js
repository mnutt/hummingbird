var sys = require('sys'),
  path = require('path'),
  fs = require('fs');

var Metric = function() {};

Metric.prototype = {
  interval: 500, // ms
  name: '',
  initialData: {},

  start: function() {
    this.resetData();
    this.job = setInterval(this.run.bind(this), this.interval);
  },

  run: function() {
    if(this.ignoreOnEmpty && this.data === this.initialData) { return; }
    this.emit('data', this.name, this.data || this.initialData);

    this.resetData();
  },

  resetData: function() {
    this.data = this.prepareInitialData();
  },

  prepareInitialData: function() {
    return JSON.parse(JSON.stringify(this.initialData));
  },

  stop: function() {
    clearInterval(this.job);
  },

  // Override if the metric needs to check if it can load.
  load: function(callback) {
    callback(null);
  },

  register: function() {
    for(metric in Metric.all) {
      if(this == Metric.all[metric]) { return; }
    }
    console.log("Loaded metric " + this.name);

    Metric.all.push(this);
  }
};

// Inherit from EventEmitter
var events = Object.create(require('events').EventEmitter.prototype);
for(var o in events) { Metric.prototype[o] = events[o]; }

Metric.all = [];

Metric.loadMetrics = function(callback) {
  Metric.availableMetricPaths(function(path) {
    var metric = require(path);
    metric.load(function(err) {
      if(err) {
        console.log(err.message);
      } else {
        metric.register();
        if(callback) { callback(metric); }
      }
    });
  });
};

Metric.availableMetricPaths = function(callback) {
  var files = fs.readdirSync(path.join(__dirname, 'metrics'));

  for(var i = 0; i < files.length; i++) {
    var file = files[i];
    var filename = file.replace(/\.(js|coffee)$/, '');
    callback(path.join(__dirname, 'metrics', filename));
  }
};

Metric.insert = function(req) {
  for(var i = 0, l = Metric.all.length; i < l; i++) {
    var metric = Metric.all[i];
    if(metric.increment) {
      metric.increment(req);
    }
  }
};

module.exports = Metric;
