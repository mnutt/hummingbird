var fs   = require('fs');
var path = require('path');

var History = function(metric) {
  this.data = [];
  this.metric = metric;
  this.name = metric.name;
};

History.dataDir = path.join(__dirname, '..', 'data');

History.prototype = {
  maxLength: 300,

  add: function(data) {
    this.data.push(data);
    if(this.data.length > this.maxLength) {
      this.data.shift();
    }

    return this.data;
  },

  dataFile: function() {
    return History.dataDir + "/" + this.name + ".json";
  },

  save: function(cb) {
    var self = this;
    var jsonOut = JSON.stringify({ts: new Date(), history: this.data});
    fs.writeFile(this.dataFile(), jsonOut, function(err) {
      if(err) {
        console.log("Error saving " + self.name + " history: " + err.message);
      }

      if(cb) { cb(err); }
    });
  },

  restore: function() {
    try {
      var data = JSON.parse(fs.readFileSync(this.dataFile()));
      this.data = data.history;
      var downtime = (new Date()) - (new Date(data.ts));
      var downtimeIntervals = Math.floor(downtime / this.metric.interval);
      console.log(downtime);
      console.log(downtimeIntervals);
      for(var i = 0; i < downtimeIntervals; i++) {
        this.add(metric.initialData);
      }
    } catch(e) {}
  },

  each: function(cb) {
    for(var i = 0, len = this.data.length; i < len; i++) {
      cb(this.data[i]);
    }
  },

  scheduleEvery: function(interval) {
    setInterval(this.save.bind(this), interval);
  }
};

module.exports = History;
