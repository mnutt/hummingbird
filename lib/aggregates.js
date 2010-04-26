var sys = require('sys');

var TimeBucketers;
if (!TimeBucketers) { TimeBucketers = {} };

TimeBucketers.closestSecondFor = function(floatApprox) {
  // Truncate
  return parseInt(floatApprox / 1000) * 1000;
}

TimeBucketers.closestMinuteFor = function(floatApprox) {
  return parseInt(floatApprox / 100000) * 100000;
};

TimeBucketers.closestHourFor = function(floatApprox) {
  // This function seems really inefficient
  var date = new Date(parseInt(floatApprox / 100000) * 100000);
  var minutes = date.getMinutes();
  var minutesInMilliseconds = minutes * 60 * 1000;
  return (date - minutesInMilliseconds);
};

TimeBucketers.closestDayFor = function(floatApprox) {
  // Ditto
  var date = new Date(parseInt(floatApprox / 100000) * 100000);
  var minutes = date.getMinutes();
  var hours = date.getHours();
  var minutesInMilliseconds = minutes * 60 * 1000;
  var hoursInMilliseconds = hours * 60 * 60 * 1000;
  return (date - hoursInMilliseconds - minutesInMilliseconds);
}

Aggregates = function(collection) {
  if ( !(this instanceof Aggregates) ) {
    return new Aggregates(collection);
  }
  this.collection = collection;
}

Aggregates.prototype = {
  mapper: function() {
    var timestamp = this.timestamp.floatApprox;
    // var timeBucket = timeBucketer(timestamp);
    var timeBucket = parseInt(timestamp / 100000) * 100000;
    emit(timeBucket, 1);
  },

  reducer: function(key, values) {
    var total = 0;
    for (var count = 0; count < values.length; ++count) {
      total += values[count];
    }
    return { count: total };
  },

  lastHour: function(dataCallback) {
    var result = this.collection.mapReduce(this.mapper, this.reducer, { scope: { timeBucketer: TimeBucketers.closestMinuteFor } }, function(err, mrCollection) {
      var metrics = [];
      mrCollection.find(function(err, cursor) {
        cursor.toArray(function(err, items) {
          var visitsByMinute = {};

          for (var i = 0; i < items.length; ++i) {
            visitsByMinute[items[i]._id] = items[i].value.count;
          }

          var visits = [];
          var now = new Date();
          var oneHourAgo = now - (60 * 60 * 1000);

          for (var i = 0; i < 60; ++i) {
            var minuteTimestamp = oneHourAgo + (i * 60 * 1000);
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
