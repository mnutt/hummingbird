require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);
require.paths.unshift(__dirname + '/deps');
require.paths.unshift(__dirname + '/deps/express/support');
require.paths.unshift(__dirname + '/deps/express/support/connect/lib');
require.paths.unshift(__dirname + '/deps/node-mongodb-native/lib');

var sys = require('sys'),
  fs = require('fs'),
  mongo = require('mongodb'),
  svc = require('service_json'),
  weekly = require('weekly');

var express = require('express');
app = express.createServer();

//require('express/plugins');

db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

db.open(function(p_db) {
  app.configure(function(){
    app.set('root', __dirname);
    app.set('db', db);
    app.set('views', __dirname + '/views');
    app.use(express.staticProvider(__dirname + '/public'));
    app.use(express.cookieDecoder());
    app.use(express.bodyDecoder());
    app.use(express.logger());

    try {
      var configJSON = fs.readFileSync(__dirname + "/config/app.json");
    } catch(e) {
      sys.log("File config/app.json not found.  Try: `cp config/app.json.sample config/app.json`");
    }

    sys.log("Started server with config: ");
    sys.puts(configJSON);
    var config = JSON.parse(configJSON.toString());

    for(var i in config) {
      app.set(i, config[i]);
    }

  });

  app.get('/', function(req, res){
    res.render('index.ejs');
  });

  app.get('/weekly', function(req, res) {
    res.render('weekly.ejs');
  });

  app.get('/login', function(req, res) {
    res.render('login.ejs');
  });

  app.post('/login', function(req, res) {
    if(req.body.password == app.set('password')) {
      req.cookies('not_secret', req.body.password);
      sys.log("Auth succeeded for " + req.body.username);
      res.redirect('/');
    } else {
      sys.log("Auth failed for " + req.body.username);
      res.redirect('/login');
    }
  });

  app.get('/sale_list', function(req, res) {
    if(app.set('sales_uri')) {
      svc.fetchJSON(app.set('sales_uri'), function(data) {
        res.contentType('json');
        res.send(200, data);
      });
    } else {
      res.send("No sales uri", 500);
    }
  });

  app.get('/week.json', function(req, res) {
    weekly.findByDay(app.settings['db'], function(data) {
      res.contentType('json');
      res.send(data);
    });
  });
  app.listen(app.set('monitor_port'), '127.0.0.1');
});

var authenticate = function(req) {
  if(app.set('password') != req.cookies['not_secret']) {
    req.redirect('/login');
  }
};
