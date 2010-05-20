var sys = require('sys'),
  fs = require('fs'),
  View = require('view').View,
  Metric = require('metric').Metric,
  Aggregates = require('aggregates').Aggregates,
  Buffer = require('buffer').Buffer,
  ws = require('deps/node-websocket-server/lib/ws'),
  arrays = require('deps/arrays'),
  querystring = require('querystring');

try {
  var configJSON = fs.readFileSync(__dirname + "/../config/app.json");
} catch(e) {
  sys.log("File config/app.json not found.  Try: `cp config/app.json.sample config/app.json`");
}
var config = JSON.parse(configJSON);

var Hummingbird = function(db, callback) {
  var pixelData = fs.readFileSync(__dirname + "/../images/tracking.gif", 'binary');
  this.pixel = new Buffer(43);
  this.pixel.write(pixelData, 'binary', 0);

  this.metrics = [];
};

Hummingbird.prototype = {
  init: function(db, callback) {
    this.setupDb(db, function() {
      callback();
    });

    this.setupWebSocket();

    this.addAllMetrics(db);
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

  setupWebSocket: function() {
    // Websocket TCP server
    var wsServer = ws.createServer({log: false});
    wsServer.listen(config.websocket_port);

    wsServer.addListener("connection", function (conn) {
      sys.log("ws connect: " + conn._id);
      conn.addListener("close", function () {
        sys.log("ws close: " + conn._id);
      });
    });

    this.wsServer = wsServer;

    sys.puts('Web Socket server running at ws://*:' + config.websocket_port);
  },

  addAllMetrics: function(db) {
    var self = this;

    Metric.allMetrics(function(metric) {
      metric.init(db);
      metric.wsServer = self.wsServer;
      self.metrics.push(metric);
    });
  },

  serveRequest: function(req, res) {
    this.writePixel(res);

    var env = this.splitQuery(req.url.split('?')[1]);
    env.timestamp = new Date();
    // sys.log(JSON.stringify(env, null, 2));

    var view = new View(env);

    env.url_key = view.urlKey();
    env.product_id = view.productId();

    this.collection.insertAll([env]);

    for(var i = 0; i < this.metrics.length; i++) {
      this.metrics[i].incrementCallback(view);
    }
  },

  splitQuery: function(query) {
    var queryString = {};
    query.replace(
      new RegExp("([^?=&]+)(=([^&]*))?", "g"),
      function($0, $1, $2, $3) { queryString[$1] = querystring.unescape($3.replace(/\+/g, ' ')); }
    );

    return queryString;
  },

  writePixel: function(res) {
    res.writeHead(200, { 'Content-Type': 'image/gif',
                         'Content-Disposition': 'inline',
                         'Content-Length': '43' });
    res.end(this.pixel);
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
