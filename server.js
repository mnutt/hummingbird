var sys = require('sys'),
    http = require('http'),
    fs = require('fs'),
    ws = require('./vendor/ws'),
    querystring = require('querystring'),
    arrays = require('./vendor/arrays'),
    mongo = require('./vendor/node-mongodb-native/lib/mongodb');

var db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

var clients = [];

var urls = { total: 0 };

setInterval(function() {
  // sys.puts("Writing to clients...");

  clients.each(function(c) {
    c.write(urls.total);
  });

  urls = { total: 0 };
}, 50);

var pixel = fs.readFileSync("images/tracking.gif", 'binary');
db.open(function(db) {
  db.collection('visits', function(err, collection) {
    http.createServer(function (req, res) {

      var env = querystring.parse(req.url.split('?')[1]);
      env.timestamp = (new Date());
      // collection.insert(env);
     // sys.puts(JSON.stringify(env, null, 2));

      res.writeHead(200, {'Content-Type': 'image/gif', 'Content-Disposition': 'inline'});
      res.write(pixel, 'binary');
      res.close();

      if(urls[env.u]) {
        urls[env.u] += 1;
      } else {
        urls[env.u] = 1;
      }
      urls.total += 1

    }).listen(8000);
  });
});

sys.puts('Tracking server running on port 8000');

// Websocket TCP server
ws.createServer(function (websocket) {
  clients.push(websocket);

  websocket.addListener("connect", function (resource) {
    // emitted after handshake
    sys.debug("connect: " + resource);
  }).addListener("close", function () {
    // emitted when server or client closes connection
    clients.remove(websocket);
    sys.debug("close");
  });
}).listen(8080);

sys.puts('Web Socket server running on port 8080');