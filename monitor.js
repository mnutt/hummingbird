require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);
require.paths.unshift(__dirname + '/deps/express/lib')

var sys = require('sys'),
  fs = require('fs'),
  mongo = require('deps/node-mongodb-native/lib/mongodb'),
  svc = require('service_json'),
  weekly = require('weekly');

require('express');
require('express/plugins');

db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

db.open(function(p_db) {
  configure(function(){
    set('root', __dirname);
    set('pagegen_uri', "http://www.gilt.com/pagegen_service/sale/sale_list");
    set('db', db);
    use(Static);

    try {
      var configJSON = fs.readFileSync(__dirname + "/config/app.json");
    } catch(e) {
      sys.log("File config/app.json not found.  Try: `cp config/app.json.sample config/app.json`");
    }
    var config = JSON.parse(configJSON);

    this.server.port = config.monitor_port;
    set('name', config.name);
  });

  get('/', function(){
    this.render('index.html.ejs');
  });

  get('/weekly', function() {
    this.render('weekly.html.ejs');
  });

  get('/sale_list', function() {
    var self = this;
    svc.fetchJSON(set('pagegen_uri'), function(data) {
      self.contentType('json');
      self.respond(200, data);
    });
  });

  get('/week.json', function() {
    var self = this;
    weekly.findByDay(Express.settings['db'], function(data) {
      self.contentType('json');
      self.respond(200, data);
    });
  });

  run();
});
