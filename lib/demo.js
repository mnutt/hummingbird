// Demo mode
//
// Replays a sample traffic log to give an idea of what real traffic
// would look like

var fs     = require('fs');
var Metric = require('./metric');

exports.running = false;

exports.run = function() {
  exports.running = true;

  fs.readFile(__dirname + "/../data/sample_traffic.log", function(err, logFile) {
    if(err) { throw err; }

    var lines = logFile.toString().split("\n");

    function submitLine(lines) {
      var line = lines[0];
      if(!line) {
        // start over
        return submitLine(logFile.toString().split("\n"));
      }

      var ip = line.split(" ")[0];
      var req = { params: {ip: ip}, headers: { referer: "/" } };
      if(Math.random() * 8 > 7) { req.params.event = "view"; }

      Metric.insert(req);

      if(!exports.running) { return; }

      setTimeout(function() {
        submitLine(lines.slice(1));
      }, Math.random() * 500);
    }

    submitLine(lines);
  });
};

exports.stop = function() {
  exports.running = false;
};

exports.toggle = function() {
  if(exports.running) {
    exports.stop();
  } else {
    exports.run();
  }
}
