var sys = require('sys');

var Metric = function(name, initialData, interval, db, addHandler) {
  if(!this instanceof Metric) {
    return new Metric(name, initialData, interval, db, addHandler);
  }

  this.name = name;
  this.initialData = this.data = initialData;
  this.interval = interval;
  this.job = null;
  this.clients = [];
  this.addHandler = addHandler;

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

    metric.insertData();
    metric.resetData();
  },

  addValue: function(view) {
    this.addHandler(view);
  },

  insertData: function() {
    var mongoData = {
      data: this.data,
      name: this.name,
      timestamp: (new Date()).getTime()
    };

    this.collection.insert(mongoData);
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