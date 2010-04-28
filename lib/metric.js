var sys = require('sys');

var Metric = function(name, initialData, interval, db, addHandler) {
  if(!this instanceof Metric) {
    return new Metric(name, initialData, interval, db, addHandler);
  }

  this.name = name;
  this.initialData = initialData;
  this.interval = interval;
  this.job = null;
  this.minuteJob = null;
  this.clients = [];
  this.addHandler = addHandler;

  this.resetMinuteData();
  this.resetData();

  var metric = this;

  db.createCollection('metrics', function(err, collection) {
    db.collection('metrics', function(err, collection) {
      metric.collection = collection;
      metric.run();
    });
  });
}

Metric.prototype = {
  run: function() {
    this.job = setInterval(this.runner, this.interval, this);
    this.minuteJob = setInterval(this.minuteRunner, 60000, this);
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

  minuteRunner: function(metric) {
    var timestamp = new Date();
    timestamp.setSeconds(0);

    var mongoData = {
      data: metric.minuteData,
      name: metric.name,
      interval: 60,
      timestamp: timestamp.getTime()
    };

    sys.log(JSON.stringify(mongoData, null, 2));

    metric.collection.insert(mongoData);
    metric.resetMinuteData();
  },

  addValue: function(view) {
    this.addHandler(view);
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

  resetMinuteData: function() {
    this.minuteData = JSON.parse(JSON.stringify(this.initialData));
  },

  stop: function() {
    clearInterval(this.job);
  }
};

exports.Metric = Metric;