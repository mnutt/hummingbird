var { Server }   = require('socket.io');
var staticServer = require('node-static');
var Metric       = require('./metric');
var demo         = require('./demo');
var auth         = require('./auth');

var fileServer = new(staticServer.Server)("./public");

var defaultHandler = function(request, response) {
  console.log(" - " + request.url);

  if (!auth.hasViewDataPermission(request.headers)) {
    console.log("Unauthorized request", { roles: request.headers['x-sandstorm-permissions'] });

    response.writeHead(403, {'Content-Type': 'text/plain'});
    response.end('Forbidden: invalid permissions');

    return;
  }

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

io.use(function(socket, next) {
  var headers = socket.request.headers;
  if (auth.hasViewDataPermission(headers)) {
    next();
  } else {
    next(new Error('Forbidden: invalid permissions'));
  }
});

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
