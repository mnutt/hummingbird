require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var sys = require('sys'),
  http = require('http'),
  ws = require('deps/node-ws/ws'),
  proxy = require('proxy'),
  weekly = require('weekly'),
  mongo = require('deps/node-mongodb-native/lib/mongodb'),
  Hummingbird = require('hummingbird').Hummingbird;

var TRACKING_PORT = 8000,
    WEB_SOCKET_PORT = 8080,
    MONITOR_PORT = 8088;

var db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

db.open(function(p_db) {
  var hummingbird = new Hummingbird(db, function() {
    http.createServer(function(req, res) {
      try {
        hummingbird.serveRequest(req, res);
      } catch(e) {
        hummingbird.handleError(req, res, e);
      }
    }).listen(TRACKING_PORT);
  });

  sys.puts('Tracking server running at http://localhost:' + TRACKING_PORT + '/tracking_pixel.gif');

  // Websocket TCP server
  ws.createServer(function (websocket) {
    websocket.addListener("connect", function (resource) {
      // emitted after handshake
      sys.log("ws connect: " + resource);
      if (resource === '/') {
        hummingbird.addClient(websocket);
      }
      else if (resource === '/aggregates') {
        hummingbird.serveAggregates(websocket);
      }
    }).addListener("close", function () {
      // emitted when server or client closes connection
      hummingbird.removeClient(websocket);
      sys.log("ws close");
    });
  }).listen(WEB_SOCKET_PORT);

  sys.puts('Web Socket server running at ws://localhost:' + WEB_SOCKET_PORT);
  var staticAssets = require('static_assets');

  try {
    http.createServer(function(req, res) {
      if(req.url.match(/\/sale_list/)) {
        proxy.route("/sale_list",
                    "http://www.gilt.com/pagegen_service/sale/sale_list", req, res);
      } else if(req.url.match(/\/week.json/)) {
        weekly.serve(db, req, res);
      } else {
        staticAssets.serveStatic(req, res);
      }
    }).listen(MONITOR_PORT);

    sys.puts('Analytics server running at http://localhost:' + MONITOR_PORT + '/');
  } catch(e) {
    sys.puts('Detected webserver already running on http://localhost:' + MONITOR_PORT + '.');
  }

});
