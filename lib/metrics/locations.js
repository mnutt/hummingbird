var http = require('http');
var geoip = require('geoip');
var path = require('path');

var locationCache = {};

var LocationsMetric = {
  name: 'Location',
  initialData: {location: []},
  interval: 500,
  ignoreOnEmpty: true, // don't send any data if we don't get any hits

  canLoad: function() {
    var cityPath = path.normalize(__dirname + '/../../GeoLiteCity.dat');

    try {
      this.cities = geoip.open(cityPath);
      return true;
    } catch(e) {
      return false;
    }
  },

  incrementCallback: function(view) {
    var remoteAddress,
      locations,
      metric = this;

    if(view.env.ip === "127.0.0.1") {
      remoteAddress = "8.8.8.8";
    } else {
      remoteAddress = view.env.ip;
    }

    location = geoip.City.record_by_addr(this.cities, remoteAddress);
    if(location.latitude) {
      metric.data.location.push(location);
    }
  }
}

for (var i in LocationsMetric)
  exports[i] = LocationsMetric[i];
