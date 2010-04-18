require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var sys = require('sys'),
  http = require('http'),
  path = require('path'),
  ws = require('deps/node-ws/ws'),
  proxy = require('proxy'),
  paperboy = require('deps/node-paperboy'),
  mongo = require('deps/node-mongodb-native/lib/mongodb'),
  hb = require('hummingbird');

var WEBROOT = path.join(path.dirname(__filename), 'public'),
    TRACKING_PORT = 8000,
    WEB_SOCKET_PORT = 8080,
    MONITOR_PORT = 8088;

var db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});


var hummingbird = new hb.Hummingbird();

db.open(function(p_db) {
  db.createCollection('visits', function(err, collection) {
    db.collection('visits', function(err, collection) {
      hummingbird.setCollection(collection);
      http.createServer(function(req, res) {
        try {
          hummingbird.serveRequest(req, res);
        } catch(e) {
          hummingbird.handleError(req, res, e);
        }
      }).listen(TRACKING_PORT);
    });
  });
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

sys.puts('Web Socket server running at ws://localhost:' + WEB_SOCKET_PORT);

try {
  http.createServer(function(req, res) {
    if(req.url.match(/\/sale_list/)) {
      proxy.route("/sale_list",
                  "http://www.gilt.com/pagegen_service/sale/sale_list", req, res);
    } else {
      paperboy.deliver(WEBROOT, req, res)
        .addHeader('Content-Type', "text/plain")
        .after(function(statCode) {
          sys.log([statCode,
                   req.method,
                   req.url,
                   req.connection.remoteAddress].join(' '));
        });
    }
  }).listen(MONITOR_PORT);

  sys.puts('Analytics server running at http://localhost:' + MONITOR_PORT + '/');
} catch(e) {
  sys.puts('Detected webserver already running on http://localhost:' + MONITOR_PORT + '.');
}