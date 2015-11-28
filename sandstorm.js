global.config = {
  tracker_port: process.env.PORT,
  dashboard_port: process.env.PORT
};

var dashboard = require('./lib/dashboard');
var tracker = require('./lib/tracker');
var demo = require('./lib/demo');

// Setup dashboard port listener
dashboard.listen(process.env.PORT);
console.log("Dashboard listening on http://*:" + config.dashboard_port + ".");

// Setup tracker port listener...
// Tracker should listen on the same port as the dashboard
tracker.listen(dashboard);

console.log("Tracker listening on http://*:" + config.tracker_port + "/tracking_pixel/t.gif.");
