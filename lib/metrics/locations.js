var http = require('http');

var LocationsMetric = {
  name: 'Location',
  initialData: {location: []},
  interval: 500,

  incrementCallback: function(view) {
    var remoteAddress,
      metric = this,
      host = "ipinfodb.com",
      client = http.createClient(80, host);

    if(view.env.ip === "127.0.0.1") {
      remoteAddress = "";
    } else {
      remoteAddress = view.env.ip;
    }

    client.on('error', function(exception) {
      console.log("IP Lookup exception:");
      console.log(JSON.stringify(exception, null, 2));
    });

    var request = client.request("GET", "/ip_query.php?ip=" + remoteAddress + "&timezone=false", {host: host});

    request.end();

    request.on('response', function(resp) {
      var buffer = '';

      resp.on('data', function(chunk) { buffer += chunk; });
      resp.on('end', function() {
        var lat, lon, city;

        if(resp.statusCode < 300) {
          lat = /<Latitude>([0-9\.\-]+)<\/Latitude>/.exec(buffer);
          lon = /<Longitude>([0-9\.\-]+)<\/Longitude>/.exec(buffer);
          city = /<City>(.*)<\/City>/.exec(buffer);
        }

        var location = {
          latitude: lat ? lat[1] : 0,
          longitude: lon ? lon[1] : 0,
          city: city ? city[1] : "Unknown"
        };

        metric.data.location.push(location);
      });
    });
  }
}

for (var i in LocationsMetric)
  exports[i] = LocationsMetric[i];
