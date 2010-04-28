var sys = require('sys'),
  TimeBucketers = require('aggregates').TimeBucketers;

var Weekly = {};

Weekly.serve = function(db, req, res) {
  db.collection('visits', function(err, collection) {
    var today = TimeBucketers.closestDayFor((new Date()).getTime());
    var counts = [];
    var _oneDay = 1000 * 60 * 60 * 24;

    for(var i = 0; i < 7; i++) {
      var startTime = today - (i + 1) * _oneDay;
      var endTime = today - i * _oneDay;
      var conditions = {
        timestamp: {
          $gt: startTime,
          $lt: endTime
        }
      };
      Weekly.fetch(collection, conditions, startTime, endTime, counts, req, res);
    }
  });
};

Weekly.fetch = function(collection, conditions, startTime, endTime, counts, req, res) {
  collection.find(conditions, function(err, cursor) {
    sys.log(JSON.stringify(cursor, null, 2));
    cursor.count(function(err, count) {
      counts.push([startTime, count]);
      sys.log(JSON.stringify(counts));

      if(counts.length == 7) {
        res.writeHead(200, {'Content-type': "text/plain"});
        res.write(JSON.stringify(counts, null, 2));
        res.close();
      }
    });
  });
};


exports.serve = Weekly.serve;