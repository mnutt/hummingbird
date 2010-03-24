var sys = require('sys'),
   http = require('http'),
     fs = require('fs'),
  querystring = require('querystring'),
  mongo = require('./vendor/node-mongodb-native/lib/mongodb');

var db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

var pixel = fs.readFileSync("images/tracking.gif", 'binary');
db.open(function(db) {
  db.collection('visits', function(err, collection) {
    http.createServer(function (req, res) {

      var env = querystring.parse(req.url.split('?')[1]);
      env.timestamp = (new Date());
      collection.insert(env);
      sys.puts(JSON.stringify(env, null, 2));

      res.writeHead(200, {'Content-Type': 'image/gif', 'Content-Disposition': 'inline'});
      res.write(pixel, 'binary');
      res.close();
    }).listen(8000);
  });
});
sys.puts('Server running at http://127.0.0.1:8000/');
