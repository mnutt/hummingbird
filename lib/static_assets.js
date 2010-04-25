var sys = require('sys'),
  paperboy = require('deps/node-paperboy'),
  proxy = require('proxy'),
  path = require('path'),
  http = require('http');

var WEBROOT = path.join(path.dirname(__filename), '..', 'public');

var serveStatic = function(port) {
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
    }).listen(port);
    sys.puts('Analytics server running at http://localhost:' + port + '/');
  } catch(e) {
    sys.puts('Detected webserver already running on http://localhost:' + port + '.');
  }
};

exports.serveStatic = serveStatic;
