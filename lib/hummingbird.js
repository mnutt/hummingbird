var sys = require('sys'),
  fs = require('fs'),
  pageview = require('view'),
  metric = require('metric'),
  arrays = require('deps/arrays'),
  querystring = require('querystring');

var Hummingbird = function(db, callback) {
  this.pixel = fs.readFileSync(__dirname + "/../images/tracking.gif", 'binary');
  this.metrics = [];
  this.init(db, callback);
};

Hummingbird.prototype = {
  init: function(db, callback) {
    this.metrics.push(new metric.Metric('all_views', {total: 0, cartAdds: 0}, 50, db, function(view) { 
      this.data.total += 1;

      if(view.event() && view.event() === "cart_add") {
        this.data.cartAdds += 1;
      }
    }));

    this.metrics.push(new metric.Metric('sales', {sales: {}}, 500, db, function(view) {
      if(view.urlKey()) {
        if(this.data.sales[view.urlKey()]) {
          this.data.sales[view.urlKey()] += 1;
        } else {
          this.data.sales[view.urlKey()] = 1;
        }
      } 
    }));

    this.setupDb(db, function() {
      callback();
    });
  },

  setupDb: function(db, callback) {
    var self = this;
    db.createCollection('visits', function(err, collection) {
      db.collection('visits', function(err, collection) {
        self.collection = collection;
        callback();
      });
    });
  },

  setCollection: function(collection) {
    this.collection = collection;
  },

  addClient: function(client) {
    for(var i = 0; i < this.metrics.length; i++) {
      this.metrics[i].clients.push(client);
    }
  },

  removeClient: function(client) {
    for(var i = 0; i < this.metrics.length; i++) {
      this.metrics[i].clients.remove(client);
    }
  },

  serveRequest: function(req, res) {
    var env = querystring.parse(req.url.split('?')[1]);
    env.timestamp = (new Date()).getTime();
    // sys.log(JSON.stringify(env, null, 2));

    this.writePixel(res);

    var view = new pageview.View(env);

    env.url_key = view.urlKey();
    env.product_id = view.productId();

    this.collection.insert(env);

    for(var i = 0; i < this.metrics.length; i++) {
      this.metrics[i].addValue(view);
    }
  },

  writePixel: function(res) {
    res.writeHead(200, { 'Content-Type': 'image/gif',
                         'Content-Disposition': 'inline',
                         'Content-Length': '43' });
    res.write(this.pixel, 'binary');
    res.close();
  },

  handleError: function(req, res, e) {
    res.writeHead(500, {});
    res.write("Server error");
    res.close();

    e.stack = e.stack.split('\n');
    e.url = req.url;
    sys.log(JSON.stringify(e, null, 2));
  }
};

exports.Hummingbird = Hummingbird;
