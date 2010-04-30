var sys = require('sys'),
  TimeBucketers = require('aggregates').TimeBucketers;

var Weekly = {};

Weekly.reducer = function(obj, prev) {
  if(obj.name == 'all_views') {
    prev.total += obj.data.total; prev.cartAdds += obj.data.cartAdds;
  } else {
    for(saleKey in obj.data.sales) {
      if(obj.data.sales[saleKey] > 10) {
        if(prev.sales[saleKey]) {
          prev.sales[saleKey] += obj.data.sales[saleKey];
        } else {
          prev.sales[saleKey] = obj.data.sales[saleKey];
        }
      }
    }
  }
};

Weekly.serve = function(db, req, res) {
  db.collection('metrics', function(err, collection) {
    var today = TimeBucketers.closestDayFor((new Date()).getTime());
    var counts = [];
    var _oneDay = 1000 * 60 * 60 * 24;

    var result = collection.group(['day'],
                                  {},
                                  { total: 0, cartAdds: 0, sales: {} },
                                  Weekly.reducer,
                                  function(err, items) {
      if(err) {
        sys.log(JSON.stringify(err, null, 2));
      }

      res.writeHead(200, {'Content-type': "text/plain"});
      res.write(JSON.stringify(items, null, 2));
      res.close();
    });
  });
};

exports.serve = Weekly.serve;