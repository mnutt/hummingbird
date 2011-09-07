var sys = require('sys'),
  path = require('path'),
  fs = require('fs');

var Metric = function() {
  this.name = null;
  this.initialData = {};
  this.interval = 500;
  this.job = null;
  this.minuteJob = null;
  this.clients = [];
  this.incrementCallback = null;
  this.aggregateCallback = null;

  this.resetMinuteData();
  this.resetData();
}

Metric.prototype = {
  init: function(db) {
    var metric = this;

    db.createCollection('metrics', function(err, collection) {
      db.collection('metrics', function(err, collection) {
        metric.collection = collection;
        metric.resetData();
        metric.resetMinuteData();
        metric.run();
      });
    });
  },

  run: function() {
    this.job = setInterval(this.runner, this.interval, this);
    this.minuteJob = setInterval(this.minuteRunner, 60000, this);
  },

  runner: function(metric) {
    // NOTE: using 'metric' in place of 'this', since run from setInterval
    if(metric.ignoreOnEmpty && !metric.isDirty) { return; }

    metric.io.sockets.volatile.emit(metric.name, metric.data);
    metric.resetData();
  },

  minuteRunner: function(metric) {
    var time = new Date();
    var timestamp = new Date(time.getTime());

    time.setMilliseconds(0);

    time.setSeconds(0);
    var timestampMinute = new Date(time.getTime());
    time.setMinutes(0);
    var timestampHour = new Date(time.getTime());
    time.setHours(0);
    var timestampDay = new Date(time.getTime());

    var mongoData = {
      data: metric.minuteData,
      name: metric.name,
      interval: 60,
      timestamp: timestamp,
      minute: timestampMinute,
      hour: timestampHour,
      day: timestampDay
    };

    sys.log(JSON.stringify(mongoData));

    metric.collection.update({ minute: timestampMinute },
                             { "$inc" : metric.minuteData },
                             { upsert: true },
                             function(err, result) {});
    metric.collection.update({ hour: timestampHour },
                             { "$inc" : metric.minuteData },
                             { upsert: true },
                             function(err, result) {});
    metric.collection.update({ day: timestampDay },
                             { "$inc" : metric.minuteData },
                             { upsert: true },
                             function(err, result) {});

    metric.resetMinuteData();
  },

  removeClient: function(client) {
    this.clients.remove(client);
  },

  addClient: function(client) {
    this.clients.push(client);
  },

  resetData: function() {
    this.data = JSON.parse(JSON.stringify(this.initialData));
    this.isDirty = false;
  },

  resetMinuteData: function() {
    this.minuteData = {};
  },

  stop: function() {
    clearInterval(this.job);
  }
};

Metric.availableMetricPaths = function(callback) {
  var files = fs.readdirSync(path.join(__dirname, 'metrics'));

  for(var i = 0; i < files.length; i++) {
    var file = files[i];
    var filename = file.replace(/\.js$/, '');
    callback(path.join(__dirname, 'metrics', filename));
  }
};

Metric.allMetrics = function(callback) {
  Metric.availableMetricPaths(function(metricPath) {
    var m = require(metricPath);
    if(typeof(m.canLoad) == "function" && m.canLoad() == false) {
      sys.log("Skipping metric " + m.name + ".");
      return;
    } else {
      sys.log("Loading metric " + m.name + ".");
    }

    // Instantiate a new metric and use the settings from the custom metrics class
    var metric = new Metric()
    for(var key in m) {
      metric[key] = m[key];
    }
    callback(metric);
  });
};

exports.Metric = Metric;
