var { Server }   = require('socket.io');
var staticServer = require('node-static');
var fs           = require('fs');
var path         = require('path');
var Metric       = require('./metric');
var demo         = require('./demo');
var auth         = require('./auth');

var fileServer = new(staticServer.Server)("./public");

var SECURITY_DISMISSED_FILE = '/var/.security_message_dismissed';

function shouldShowSecurityBanner() {
  try {
    return !fs.existsSync(SECURITY_DISMISSED_FILE);
  } catch (e) {
    return true;
  }
}

function dismissSecurityBanner() {
  try {
    fs.writeFileSync(SECURITY_DISMISSED_FILE, '');
  } catch (e) {
    console.error('Error dismissing security banner:', e);
  }
}

var defaultHandler = function(request, response) {
  console.log(" - " + request.url);

  if (!auth.hasViewDataPermission(request.headers)) {
    console.log("Unauthorized request", { roles: request.headers['x-sandstorm-permissions'] });

    response.writeHead(403, {'Content-Type': 'text/plain'});
    response.end('Forbidden: invalid permissions');

    return;
  }

  if (request.url === "/dismiss-security-message") {
    dismissSecurityBanner();
    response.writeHead(302, {'Location': '/'});
    response.end();
    return;
  }

  if(request.url === "/demo") {
    demo.toggle();
  }

  // Inject security banner into index.html if needed
  if ((request.url === "/" || request.url === "/index.html") && shouldShowSecurityBanner()) {
    var indexPath = path.join(__dirname, '../public/index.html');
    fs.readFile(indexPath, 'utf8', function(err, html) {
      if (err) {
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.end('Error reading index.html');
        return;
      }

      var bannerHtml = '<div id="security-banner">' +
        '<strong>Security Notice:</strong> If you shared tracking keys before this update (v0.4.1), ' +
        'please revoke them and create new ones. ' +
        '<a href="/dismiss-security-message">Dismiss</a>' +
        '</div>';

      html = html.replace('<body>', '<body>\n' + bannerHtml);
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(html);
    });
    return;
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
