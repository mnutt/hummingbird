// Locations
//
// Sends individual requests, geolocated using ip address

var geoip  = require('geoip-lite');
var Metric = require('../metric');

var locations = Object.create(Metric.prototype);

locations.name = 'locations';
locations.initialData = [];
locations.interval = 500; // ms
locations.ignoreOnEmpty = true;

locations.increment = function(request) {
  var remoteAddress = this.ipFor(request);

  var location = geoip.lookup(remoteAddress);

  if(location && location.ll) {
    this.data.push({
      city:      location.city,
      region:    location.region[0],
      country:   location.country,
      latitude:  location.ll[0],
      longitude: location.ll[1],
      event:     request.params.event
    });
  }
};

locations.ipFor = function(request) {
  console.log(request.headers);
  var ip;
  if(request.headers && request.headers['x-forwarded-for']) {
    ip = request.headers['x-forwarded-for'].split(', ').shift();
  } else if(request.headers && request.headers['x-real-ip']) {
    ip = request.headers['x-real-ip'];
  } else if(request.connection && request.connection.remoteAddress) {
    ip = request.connection.remoteAddress;
  } else if(request.params && request.params.ip) {
    ip = request.params.ip;
  } else {
    ip = "127.0.0.1";
  }

  if(ip == "127.0.0.1") {
    return "8.8.8.8"; // Mountain view, can be geolocated
  } else {
    return ip;
  }
}

// geoip-lite bundles its own database, no setup needed
locations.load = function(callback) {
  callback(null);
};

module.exports = locations;
