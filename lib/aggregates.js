var sys = require('sys');

var TimeBucketers;
if (!TimeBucketers) { TimeBucketers = {} };

TimeBucketers.closestSecondFor = function(floatApprox) {
  return parseInt(floatApprox / 1000) * 1000;
}

TimeBucketers.closestMinuteFor = function(floatApprox) {
  var date = new Date(timestamp);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.getTime();
};

TimeBucketers.closestHourFor = function(floatApprox) {
  var date = new Date(timestamp);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.getTime();
};

TimeBucketers.closestDayFor = function(timestamp) {
  var date = new Date(timestamp);
  date.setMinutes(0);
  date.setHours(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.getTime();
}

Aggregates = function(collection) {
  if ( !(this instanceof Aggregates) ) {
    return new Aggregates(collection);
  }
  this.collection = collection;
}

Aggregates.prototype = {
  mapper: function() {
    this.timestamp.setMilliseconds(0);
    this.timestamp.setSeconds(0);
    // var timeBucket = timeBucketer(timestamp);
    emit(this.timestamp, 1);
  },

  reducer: function(key, values) {
    var total = 0;
    for (var count = 0; count < values.length; ++count) {
      total += values[count];
    }
    return { count: total };
  },

  lastHour: function(dataCallback) {
    var now = new Date();
    var oneHourAgo = new Date(now - (60 * 60 * 1000));
    var result = this.collection.mapReduce(this.mapper, this.reducer, { query: { 'timestamp': { '$gte': new Date(oneHourAgo) } }, scope: { timeBucketer: TimeBucketers.closestMinuteFor } }, function(err, mrCollection) {
      var metrics = [];

      mrCollection.find({ 'timestamp': { '$gte': oneHourAgo } }, function(err, cursor) {
        cursor.toArray(function(err, items) {
          var visitsByMinute = {};

          for (var i = 0; i < items.length; ++i) {
            visitsByMinute[items[i]._id] = items[i].value.count;
          }

          var visits = [];
          for (var i = 0; i < 60; ++i) {
            var minuteTimestamp = new Date(oneHourAgo + (i * 60 * 1000));
            var value = 0;
            if (visitsByMinute[minuteTimestamp]) {
              value = visitsByMinute[minuteTimestamp];
            }
            visits.push(value);
          }

          dataCallback(visits);
        });
      });
    });
  }
};

exports.Aggregates = Aggregates;
exports.TimeBucketers = TimeBucketers;