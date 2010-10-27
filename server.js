require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var http = require('http'),
  weekly = require('weekly'),
  fs = require('fs'),
  static = require('deps/node-static/lib/node-static'),
  io = require('deps/node-socket.io'),
  mongo = require('deps/node-mongodb-native/lib/mongodb'),
  Hummingbird = require('hummingbird').Hummingbird;

try {
  var configJSON = fs.readFileSync(__dirname + "/config/app.json");
} catch(e) {
  console.log("File config/app.json not found.  Try: `cp config/app.json.sample config/app.json`");
}
var config = JSON.parse(configJSON.toString());

db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

db.addListener("error", function(error) {
  console.log("Error connecting to mongo -- perhaps it isn't running?");
});

db.open(function(p_db) {
  var hummingbird = new Hummingbird();
  hummingbird.init(db, function() {
    var server = http.createServer(function(req, res) {
      try {
        hummingbird.serveRequest(req, res);
      } catch(e) {
        hummingbird.handleError(req, res, e);
      }
    });
    server.listen(config.tracking_port, "0.0.0.0");

    socket = io.listen(server);

    socket.on('connection', function(client){
      // new client is here!
      client.on('disconnect', function(){ console.log("Lost ws client"); })
    });

    hummingbird.socket = socket;
    hummingbird.addAllMetrics(socket, db);

    console.log('Web Socket server running at ws://*:' + config.tracking_port);
  });

  console.log('Tracking server running at http://*:' + config.tracking_port + '/tracking_pixel.gif');
});

if(config.enable_dashboard) {
  var file = new(static.Server)('./public');

  http.createServer(function (request, response) {
    request.addListener('end', function () {
      file.serve(request, response);
    });
  }).listen(config.dashboard_port);

  console.log('Dashboard server running at http://*:' + config.dashboard_port);
}
