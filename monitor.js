require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);
require.paths.unshift(__dirname + '/deps/express/lib')

var sys = require('sys'),
  fs = require('fs'),
  mongo = require('deps/node-mongodb-native/lib/mongodb'),
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
    app.use(express.staticProvider(__dirname + "public"));
    app.use(express.cookieDecoder);
    app.use(express.logger());

    try {
      var configJSON = fs.readFileSync(__dirname + "/config/app.json");
    } catch(e) {
      sys.log("File config/app.json not found.  Try: `cp config/app.json.sample config/app.json`");
    }

    sys.log("Started server with config: ");
    sys.puts(configJSON);
    var config = JSON.parse(configJSON.toString());

    //this.server.port = config.monitor_port;
    app.port = config.monitor_port;

    for(var i in config) {
      app.set(i, config[i]);
    }

  });

  app.get('/', function(){
    authenticate(this);
    this.render('index.html.ejs');
  });

  app.get('/weekly', function() {
    authenticate(this);
    this.render('weekly.html.ejs');
  });

  app.get('/login', function() {
    this.render('login.html.ejs');
  });

  app.post('/login', function() {
    if(this.params.post.password == set('password')) {
      this.cookie('not_secret', this.params.post.password);

      sys.log("Auth succeeded for " + this.params.post.username);
      this.redirect('/');
    } else {
      sys.log("Auth failed for " + this.params.post.username);
      this.redirect('/login');
    }
  });

  app.get('/sale_list', function() {
    authenticate(this);
    var self = this;

    if(set('sales_uri')) {
      svc.fetchJSON(set('sales_uri'), function(data) {
        self.contentType('json');
        self.respond(200, data);
      });
    } else {
      self.respond(500, "No sales uri");
    }
  });

  app.get('/week.json', function() {
    authenticate(this);
    var self = this;
    weekly.findByDay(Express.settings['db'], function(data) {
      self.contentType('json');
      self.respond(200, data);
    });
  });

  app.listen();
});

var authenticate = function(req) {
  if(set('password') != req.cookies['not_secret']) {
    req.redirect('/login');
  }
};
