var sys = require('sys'),
  Metric = require('./metric').Metric,
  TimeBucketers = require('./aggregates').TimeBucketers;

var Weekly = {};

Weekly.reducer = function(obj, prev) {
  if(obj.name == 'all_views') {
    prev.total += obj.data.total; prev.cartAdds += obj.data.cartAdds;
  } else {
    if(!prev.sales) { prev.sales = {}; }

    for(var saleKey in obj.data.sales) {
      prev.sales[saleKey] = (prev.sales[saleKey] || 0) + obj.data.sales[saleKey];
    }
  }
};

Weekly.findByDay = function(db, callback) {
  db.collection('metrics', function(err, collection) {
    if(err) {
      sys.log(JSON.stringify(err, null, 2));
    }

    var today = TimeBucketers.closestDayFor((new Date()).getTime());
    var _oneDay = 1000 * 60 * 60 * 24;

    var result = collection.find({ day: { $gte: new Date(today - _oneDay * 7) } }, { sort: [['day', 'descending']] }, function(err, cursor) {

      cursor.toArray(function(err, items) {
        if(err) {
          sys.log(JSON.stringify(err, null, 2));
        }

        // Turn the sales hash into an array, for sorting
        for(var i = 0; i < items.length; i++) {
          var item = items[i];

          item.day = item.day.getTime();
          delete item._id;

          Metric.allMetrics(function(metric) {
            if(metric.aggregateCallback) { metric.aggregateCallback(item); }
          });

        }

        callback(JSON.stringify(items, null, 2))
      });
    });
  });
};

exports.findByDay = Weekly.findByDay;
