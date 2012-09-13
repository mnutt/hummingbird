var http = require('http');
var url = require('url');
var Metric = require('./metric');
var pixel = require('./pixel');

var pixelHandler = function(req, res) {
  res.writeHead(200, pixel.headers);
  res.end(pixel.data);

  req.params = url.parse(req.url, true).query;

  Metric.insert(req);
};

exports.listen = function(server, address) {
  if(typeof(server) === "number") {
    var port = server;
    http.createServer(pixelHandler).listen(port, address);
  } else {
    // Attach to an existing server
    var oldListeners = server.listeners('request');
    server.removeAllListeners('request');

    server.on('request', function(req, res) {
      if(req.url.match(/^\/tracking_pixel/)) {
        pixelHandler(req, res);
      } else {
        for (var i = 0, l = oldListeners.length; i < l; i++) {
          oldListeners[i].call(server, req, res);
        }
      }
    });
  }
};

exports.listenUdp = function(port, address) {
  var udpServer = dgram.createSocket("udp4");

  udpServer.on("message", function(message, rinfo) {
    try {
      var data = JSON.parse(message);
    } catch(e) {
      console.log("Error parsing UDP message: " + e.message);
    }

    Metric.insert({ip: data.ip, params: data});
  });
};
