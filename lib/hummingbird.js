var sys = require('sys'),
  fs = require('fs'),
  pageview = require('view'),
  metric = require('metric'),
  arrays = require('deps/arrays'),
  querystring = require('querystring');

var Hummingbird = function() {
  this.pixel = fs.readFileSync(__dirname + "/../images/tracking.gif", 'binary');
  this.init();
};

Hummingbird.prototype = {
  init: function() {
    this.allViewsMetric = new metric.Metric({total: 0, cartAdds: 0}, 50);
    this.salesMetric = new metric.Metric({sales: {}}, 500);

    this.allViewsMetric.run();
    this.salesMetric.run();
  },

  setCollection: function(collection) {
    this.collection = collection;
  },

  addClient: function(client) {
    this.allViewsMetric.clients.push(client);
    this.salesMetric.clients.push(client);
  },

  removeClient: function(client) {
    this.allViewsMetric.clients.remove(client);
    this.salesMetric.clients.remove(client);
  },

  serveRequest: function(req, res) {
    var env = querystring.parse(req.url.split('?')[1]);
    env.timestamp = (new Date());
    // sys.log(JSON.stringify(env, null, 2));

    this.writePixel(res);

    this.collection.insert(env);

    var view = new pageview.View(env);
    if(view.urlKey()) {
      if(this.salesMetric.data.sales[view.urlKey()]) {
        this.salesMetric.data.sales[view.urlKey()] += 1;
      } else {
        this.salesMetric.data.sales[view.urlKey()] = 1;
      }
    }

    if(view.event() && view.event() === "cart_add") {
      this.allViewsMetric.data.cartAdds += 1;
    }

    this.allViewsMetric.data.total += 1;
  },

  writePixel: function(res) {
    res.writeHead(200, { 'Content-Type': 'image/gif',
                         'Content-Disposition': 'inline',
                         'Content-Length': '43' });
    res.write(this.pixel, 'binary');
    res.end();
  },

  handleError: function(req, res, e) {
    res.writeHead(500, {});
    res.end();

    e.stack = e.stack.split('\n');
    e.url = req.url;
    sys.log(JSON.stringify(e, null, 2));
  }
};

exports.Hummingbird = Hummingbird;