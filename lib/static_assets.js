var sys = require('sys'),
  paperboy = require('deps/node-paperboy'),
  path = require('path');

var WEBROOT = path.join(path.dirname(__filename), '..', 'public');

var serveStatic = function(req, res) {
  paperboy.deliver(WEBROOT, req, res)
    .addHeader('Content-Type', "text/plain")
    .after(function(statCode) {
      sys.log([statCode,
               req.method,
               req.url,
               req.connection.remoteAddress].join(' '));
    });
};

exports.serveStatic = serveStatic;
