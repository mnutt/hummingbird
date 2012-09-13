// Locations
//
// Sends individual requests, geolocated using ip address

var geoip = require('geoip');
var path = require('path');
var Metric = require('../metric');

var cities;

var locations = Object.create(Metric.prototype);

locations.name = 'location';
locations.initialData = [];
locations.interval = 500; // ms
locations.ignoreOnEmpty = true;

locations.canLoad = function() {
  var cityPath = path.normalize(__dirname + '/../../GeoLiteCity.dat');

  try {
    cities = geoip.open(cityPath);
    return true;
  } catch(e) {
    console.log("Couldn't load geoip database.");
    return false;
  }
};

locations.increment = function(request) {
  var remoteAddress;

  if(request.ip === "127.0.0.1") {
    remoteAddress = "8.8.8.8"; // Mountain View, CA
  } else {
    remoteAddress = request.ip;
  }

  var location = geoip.City.record_by_addr(cities, remoteAddress);

  if(location && location.latitude) {
    this.data.push({
      city:      location.city,
      latitude:  location.latitude,
      longitude: location.longitude,
      type:      request.params.type
    });
  }
};

module.exports = locations;
