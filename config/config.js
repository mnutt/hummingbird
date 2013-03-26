module.exports = config = {
    "name" : "Hummingbird",

    "demo_mode": true,

    "enable_dashboard" : true,
    "dashboard_port" : 8080,

    // If you want to have the tracking pixel listen on a different port
    // (for instance in order to password-protect your dashboard) you can
    // specify the port to listen on (change from false to port number)
    "tracking_port" : false,

    // enable UDP tracking?
    "udp_tracking" : false,

    // if setting udp_tracking above to true, uncomment out these values
    // "udp_address" : "127.0.0.1",
    // "udp_port" : 8000,

    "mongo_host" : "localhost",
    "mongo_port" : 27017,

    "capistrano" : {
        "repository" :       "git://github.com/mnutt/hummingbird.git",
        "hummingbird_host" : "hummingbird.your-host.com"
    }
}