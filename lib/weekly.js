var sys = require('sys'),
  TimeBucketers = require('aggregates').TimeBucketers;

var Weekly = {};

Weekly.reducer = function(obj, prev) {
  if(obj.name == 'all_views') {
    prev.total += obj.data.total; prev.cartAdds += obj.data.cartAdds;
  } else {
    if(!prev.sales) { prev.sales = {}; }

    for(var saleKey in obj.data.sales) {
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
    var _oneDay = 1000 * 60 * 60 * 24;

    var result = collection.group(['day'],
                                  { day: { $gte: new Date(today - _oneDay * 7) } },
                                  { total: 0, cartAdds: 0, sales: null},
                                  Weekly.reducer.toString(),
                                  function(err, items) {
      if(err) {
        sys.log(JSON.stringify(err, null, 2));
      }

      items = items.sort(function(a, b) {
        if(a.day > b.day) { return -1; } else { return 1; }
      });

      // Turn the sales hash into an array, for sorting
      items.each(function(item) {
        item.tmpSales = item.sales;
        item.sales = [];
        for(sale in item.tmpSales) {
          item.sales.push({url_key: sale, views: item.tmpSales[sale]});
        }

        // Sort by sale numbers descending
        item.sales = item.sales.sort(function(a, b) {
          if(a.views == b.views) {
            return 0;
          } else if(a.views > b.views) {
            return -1;
          } else { return 1; }
        });

        delete item.tmpSales;
      });

      res.writeHead(200, {'Content-type': "text/plain"});
      res.write(JSON.stringify(items, null, 2));
      res.close();
    });
  });
};

exports.serve = Weekly.serve;