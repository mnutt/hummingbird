var http = require('http');
var geoip = require('geoip');
var path = require('path');

var locationCache = {};

var LocationsMetric = {
  name: 'location',
  initialData: [],
  interval: 500,
  ignoreOnEmpty: true, // don't send any data if we don't get any hits

  canLoad: function() {
    var cityPath = path.normalize(__dirname + '/../../GeoLiteCity.dat');

    try {
      this.cities = new geoip.City(cityPath);
      return true;
    } catch(e) {
      console.log("Couldn't load geoip database.");
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

    location = this.cities.lookupSync(remoteAddress);

    if(location && location.latitude) {
      metric.data.push({ city: location.city,
                         latitude: location.latitude,
                         longitude: location.longitude,
                         type: view.env.type });
    }
  }
}

for (var i in LocationsMetric)
  exports[i] = LocationsMetric[i];
