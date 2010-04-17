var services = require('./service_json');
var sys = require('sys');

exports.route = function(path, remoteURL, req, res) {
  sys.log("Routing " + path + " to " + remoteURL);
  services.fetchJSON(remoteURL, function(data) {
    res.writeHead(200, {'Content-type': "text/plain"});
    res.write(data);
    res.end();
  });
};
