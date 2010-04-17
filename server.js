var sys = require('sys'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    ws = require('./deps/node-ws/ws'),
    proxy = require('./lib/proxy'),
    pageview = require('./lib/view'),
    metric = require('./lib/metric'),
    querystring = require('querystring'),
    arrays = require('./deps/arrays'),
    paperboy = require('./deps/node-paperboy'),
    mongo = require('./deps/node-mongodb-native/lib/mongodb');

var WEBROOT = path.join(path.dirname(__filename), 'public'),
    TRACKING_PORT = 8000,
    WEB_SOCKET_PORT = 8080,
    MONITOR_PORT = 8088;

var db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

var allViewsMetric = new metric.Metric({total: 0, cartAdds: 0}, 50);
var salesMetric = new metric.Metric({sales: {}}, 500);

allViewsMetric.run();
salesMetric.run();

var pixel = fs.readFileSync("images/tracking.gif", 'binary');
db.open(function(p_db) {
  db.createCollection('visits', function(err, collection) {
    db.collection('visits', function(err, collection) {
      http.createServer(function (req, res) {
        try {
          var env = querystring.parse(req.url.split('?')[1]);
          env.timestamp = (new Date());
          collection.insert(env);
          // sys.log(JSON.stringify(env, null, 2));

          res.writeHead(200, {'Content-Type': 'image/gif', 'Content-Disposition': 'inline'});
          res.write(pixel, 'binary');
          res.end();

          var view = new pageview.View(env);
          if(view.urlKey()) {
            if(salesMetric.data.sales[view.urlKey()]) {
              salesMetric.data.sales[view.urlKey()] += 1;
            } else {
              salesMetric.data.sales[view.urlKey()] = 1;
            }
          }

          if(view.event() && view.event() === "cart_add") {
            allViewsMetric.data.cartAdds += 1;
          }

          allViewsMetric.data.total += 1;
        } catch(e) { e.stack = e.stack.split('\n'); sys.log(JSON.stringify(e, null, 2)); }
      }).listen(TRACKING_PORT);
    });
  });
});

sys.puts('Tracking server running at http://localhost:' + TRACKING_PORT + '/tracking_pixel.gif');

// Websocket TCP server
ws.createServer(function (websocket) {
  allViewsMetric.addClient(websocket);
  salesMetric.addClient(websocket);

  websocket.addListener("connect", function (resource) {
    // emitted after handshake
    sys.log("ws connect: " + resource);
  }).addListener("close", function () {
    // emitted when server or client closes connection
    allViewsMetric.removeClient(websocket);
    salesMetric.removeClient(websocket);
    sys.log("ws close");
  });
}).listen(WEB_SOCKET_PORT);

sys.puts('Web Socket server running at ws://localhost:' + WEB_SOCKET_PORT);

try {
  http.createServer(function(req, res) {
    if(req.url.match(/\/sale_list/)) {
      proxy.route("/sale_list", "http://www.gilt.com/pagegen_service/sale/sale_list", req, res);
    } else {
      paperboy.deliver(WEBROOT, req, res)
        .addHeader('Content-Type', "text/plain")
        .after(function(statCode) { sys.log([statCode, req.method, req.url, req.connection.remoteAddress].join(' ')); });
    }
  }).listen(MONITOR_PORT);

  sys.puts('Analytics server running at http://localhost:' + MONITOR_PORT + '/');
} catch(e) {
  if(e && e.message == "Address already in use") {
    sys.log('Detected port ' + MONITOR_PORT + ' in use; assuming it is being served by another webserver.');
  } else { throw(e); }
}
