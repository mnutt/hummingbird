var { Server }   = require('socket.io');
var staticServer = require('node-static');
var Metric       = require('./metric');
var demo         = require('./demo');

var fileServer = new(staticServer.Server)("./public");

var defaultHandler = function(request, response) {
  console.log(" - " + request.url);
  if(request.url === "/demo") {
    demo.toggle();
  }
  fileServer.serve(request, response);
};

var server = require('http').createServer(defaultHandler);

var ioOptions = {};
if(config.origins) {
  ioOptions.cors = { origin: config.origins };
  console.log("Restricting dashboard websockets to " + config.origins + ".");
}

var io = new Server(server, ioOptions);

setInterval(function() {
  var userCount = io.sockets.sockets.size;
  console.log(userCount + " users connected.");
}, 60 * 1000);

Metric.loadMetrics(function(metric) {
  metric.on('data', function(metricName, data) {
    io.volatile.emit(metricName, data);
  });

  metric.start();
});

module.exports = server;
