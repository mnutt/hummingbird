config = require('./config/config');

var dashboard = require('./lib/dashboard');
var tracker = require('./lib/tracker');


dashboard.listen(config.dashboard_port, config.dashboard_address);
console.log("Dashboard listening on http://" + (config.dashboard_address || '*') + ":" + config.dashboard_port + ".");


// Tracker should listen on the same port as the dashboard
tracker.listen(dashboard);
console.log("Tracker listening on http://" + (config.dashboard_address || '*') + ":" + config.dashboard_port + "/tracking_pixel.gif.");


// If you want to have the tracking pixel listen on a different port
// (for instance in order to password-protect your dashboard) you can
// uncomment this
//
// tracker.listen(8000, "0.0.0.0");

// UDP tracking
//
// tracker.listenUdp(8000, "0.0.0.0");
