config = require('./lib/config');

var dashboard = require('./lib/dashboard');
var tracker = require('./lib/tracker');
var demo = require('./lib/demo');


// Setup dashboard port listener
dashboard.listen(config.dashboard_port, config.dashboard_address);
console.log("Dashboard listening on http://" + (config.dashboard_address || "*") + ":" + config.dashboard_port + ".");


// Setup tracker port listener...
if (typeof config.tracking_port != 'number') {
    // Tracker should listen on the same port as the dashboard
    tracker.listen(dashboard);

} else {
    // Tracker should listen on specified port
    tracker.listen(config.tracking_port, config.tracking_address);
}

console.log("Tracker listening on http://" + (config.tracking_address || "*") + ":" + (config.tracking_port || config.dashboard_port) + "/tracking_pixel.gif.");

// Setup UDP tracking
if (typeof config.udp_tracking_port == 'number') {
  tracker.listenUdp((config.udp_tracking_port || 8000), (config.udp_tracking_address || "0.0.0.0"));
}

// Run in demo mode
if (config.demo_mode) {
  demo.run(tracker);
}
