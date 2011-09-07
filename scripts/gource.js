var sys = require('sys'),
  arrays = require('../lib/arrays'),
  mongo = require('mongodb');

var db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

db.open(function(p_db) {
  db.collection('visits', function(err, collection) {
    collection.find({}, {limit: 1000, order: {timestamp: -1}}, function(err, cursor) {
      cursor.each(function(err, item) {
        if(item) {
          if(!item.timestamp) { return; }
          var itemString = "";

          var path = [item.channel, item.prop1, item.url_key, item.product_id].compact().join('/');
          sys.log(path);

          [ Math.round(item.timestamp / 1000),
            item.guid,
            'A',
            path ].join('|');

          sys.log(itemString);
        } else {
          sys.puts('FINISHED');
        }
      });
    });
  });
});
