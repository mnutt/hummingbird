// Locations
//
// Sends individual requests, geolocated using ip address

var util   = require('util');
var geoip  = require('geoip');
var path   = require('path');
var Metric = require('../metric');
var http   = require('http');
var zlib   = require('zlib');
var fs     = require('fs');

var GEO_IP_DOWNLOAD = "http://hummingbird-data.s3.amazonaws.com/GeoLiteCity.dat.gz"

var cities;

var locations = Object.create(Metric.prototype);

locations.name = 'locations';
locations.initialData = [];
locations.interval = 500; // ms
locations.ignoreOnEmpty = true;

locations.increment = function(request) {
  var remoteAddress = this.ipFor(request);

  var location = cities.lookupSync(remoteAddress);

  if(location && location.latitude) {
    this.data.push({
      city:      location.city,
      region:    location.region,
      country:   location.country_code,
      latitude:  location.latitude,
      longitude: location.longitude,
      event:     request.params.event
    });
  }
};

locations.ipFor = function(request) {
  var ip;
  if(request.headers && request.headers['x-forwarded-for']) {
    ip = request.headers['x-forwarded-for'].split(', ').shift();
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

// Try to load the binary geoip database.  If it is not available,
// try to download it from MaxMind and unzip it.
locations.load = function(callback) {
  var cityPath = path.normalize(__dirname + '/../../GeoLiteCity.dat');

  function setupCities() {
    try {
      cities = new geoip.City(cityPath);
      return callback(null);
    } catch(e) {
      return callback(new Error("Couldn't load geoip database " + cityPath));
    }
  }

  fs.stat(cityPath, function(notDownloaded) {
    if(notDownloaded) {
      console.log("Downloading GeoLiteCity.dat to " + cityPath);
      locations.downloadGzipData(GEO_IP_DOWNLOAD, cityPath, function(err) {
        if(err) { return callback(err); }

        setupCities();
      });
    } else {
      setupCities();
    }
  });
};

locations.downloadGzipData = function(url, path, callback) {
  http.get(url, function(res) {
    if(res.statusCode != "200") {
      return callback(new Error("HTTP error: " + res.statusCode));
    }

    var gunzip = zlib.createGunzip();
    var out = fs.createWriteStream(path);

    res.pipe(gunzip).pipe(out);

    gunzip.on('end', function(err) {
      callback(err);
    });
  });
};

module.exports = locations;
