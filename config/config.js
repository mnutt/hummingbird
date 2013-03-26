module.exports = config = {
    "name" : "Hummingbird",

    // Replay some existing traffic logs to get an idea of what Hummingbird
    // looks like.  Change this to false when you're ready to actually use
    // Hummingbird in production.
    "demo_mode": true,

    // Port where the dashboard will be shown.  Change it to false to disable
    // the dashboard. (you might do this if you were integrating
    // Hummingbird into an existing admin interface)
    "dashboard_port" : 8080,

    // If you want to have the tracking pixel listen on a different port
    // (for instance in order to password-protect your dashboard) you can
    // specify the port to listen on (change from false to port number)
    "tracking_port" : 8000,

    // Allow stats to be sent over UDP instead of HTTP.  This works best for
    // sending stats from backend servers within the same datacenter as
    // Hummingbird.  Change to false to disable.
    "udp_tracking_port" : 8000,

    // Interface to bind the UDP listener to. Use 127.0.0.1 to only allow
    // other apps on your machine to connect, or 0.0.0.0 to bind to all
    // interfaces and allow any machine to connect.
    "udp_trackin_address" : "127.0.0.1"
}
