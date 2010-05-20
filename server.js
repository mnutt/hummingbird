require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var sys = require('sys'),
  http = require('http'),
  weekly = require('weekly'),
  fs = require('fs'),
  mongo = require('deps/node-mongodb-native/lib/mongodb'),
  Hummingbird = require('hummingbird').Hummingbird;

try {
  var configJSON = fs.readFileSync(__dirname + "/config/app.json");
} catch(e) {
  sys.log("File config/app.json not found.  Try: `cp config/app.json.sample config/app.json`");
}
var config = JSON.parse(configJSON);

db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

db.addListener("error", function(error) {
  sys.puts("Error connecting to mongo -- perhaps it isn't running?");
});

db.open(function(p_db) {
  var hummingbird = new Hummingbird();
  hummingbird.init(db, function() {
    http.createServer(function(req, res) {
      try {
        hummingbird.serveRequest(req, res);
      } catch(e) {
        hummingbird.handleError(req, res, e);
      }
    }).listen(config.tracking_port);
  });

  sys.puts('Tracking server running at http://*:' + config.tracking_port + '/tracking_pixel.gif');
});
