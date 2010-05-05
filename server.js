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
    MONITOR_PORT = 8888;

db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

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

  sys.puts('Tracking server running at http://*:' + TRACKING_PORT + '/tracking_pixel.gif');

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

  sys.puts('Web Socket server running at ws://*:' + WEB_SOCKET_PORT);
  var staticAssets = require('static_assets');

  require('monitor');
});
