require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var http = require('http'),
  weekly = require('weekly'),
  fs = require('fs'),
  dgram = require('dgram'),
  static = require('node-static'),
  io = require('socket.io'),
  mongo = require('mongodb'),
  Hummingbird = require('hummingbird').Hummingbird;

try {
  var configJSON = fs.readFileSync(__dirname + "/config/app.json");
} catch(e) {
  console.log("File config/app.json not found.  Try: `cp config/app.json.sample config/app.json`");
}
var config = JSON.parse(configJSON.toString());

db = new mongo.Db('hummingbird', new mongo.Server(config.mongo_host, config.mongo_port, {}), {});

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

    if(config.udp_address) {
      var udpServer = dgram.createSocket("udp4");

      udpServer.on("message", function(message, rinfo) {
        console.log("message from " + rinfo.address + " : " + rinfo.port);

        var data = JSON.parse(message);
        hummingbird.insertData(data);
      });

      udpServer.bind(config.udp_port, config.udp_address);

      console.log('UDP server running on UDP port ' + config.udp_port);
    }
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
