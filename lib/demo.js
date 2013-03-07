// Demo mode
//
// Replays a sample traffic log to give an idea of what real traffic
// would look like

var fs     = require('fs');
var Metric = require('./metric');

exports.run = function() {
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
      if(Math.random() * 8 > 7) { req.params.event = "cart_add"; }

      // More requests during middday, less at night.  For a less even distribution
      var hour = 1000 * 60 * 60;
      var day = hour * 24;
      var timeOfDayVariation = Math.sin((new Date().getTime() - (6 * hour)) % day / day * Math.PI);

      Metric.insert(req);
      setTimeout(function() {
        submitLine(lines.slice(1));
      }, Math.random() * 500 * timeOfDayVariation);
    }

    submitLine(lines);
  });
};
