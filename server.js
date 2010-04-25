require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var sys = require('sys'),
  http = require('http'),
  ws = require('deps/node-ws/ws'),
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
    hummingbird.addClient(websocket);

    websocket.addListener("connect", function (resource) {
      // emitted after handshake
      sys.log("ws connect: " + resource);
    }).addListener("close", function () {
      // emitted when server or client closes connection
      hummingbird.removeClient(websocket);
      sys.log("ws close");
    });
  }).listen(WEB_SOCKET_PORT);
});

sys.puts('Web Socket server running at ws://localhost:' + WEB_SOCKET_PORT);
var staticAssets = require('static_assets');
staticAssets.serveStatic(MONITOR_PORT);
