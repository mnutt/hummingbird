var http = require('http'),
  weekly = require('./lib/weekly'),
  config = require('./config/config'),
  dgram = require('dgram'),
  static = require('node-static'),
  sio = require('socket.io'),
  mongo = require('mongodb'),
  Hummingbird = require('./lib/hummingbird').Hummingbird;

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


    if(config.enable_dashboard) {
      var file = new(static.Server)('./public');

      var dashboardServer = http.createServer(function (request, response) {
        request.addListener('end', function () {
          file.serve(request, response);
        });
      });

      dashboardServer.listen(config.dashboard_port);

      io = sio.listen(dashboardServer);

      console.log('Dashboard server running at http://*:' + config.dashboard_port);
    } else {
      io = sio.listen(server);
    }

    io.set('log level', 2);

    hummingbird.io = io;
    hummingbird.addAllMetrics(io, db);

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
