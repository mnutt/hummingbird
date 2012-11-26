var http = require('http');
var url = require('url');
var dgram = require('dgram');
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
  var server = dgram.createSocket("udp4");

  server.on("message", function (message, rinfo) {
    var data;
    try {
      data = JSON.parse(message.toString());
    } catch(e) {
      return console.log("Error parsing UDP message: " + e.message);
    }

    Metric.insert({ip: data.ip, params: data});
  });

  server.on("listening", function () {
    var address = server.address();
    console.log("server listening " +
        address.address + ":" + address.port);
  });

  server.bind(port, address);

};