require.paths.unshift('deps/express/lib')
require('express');
require('express/plugins');

var sys = require('sys'),
  svc = require('service_json'),
  weekly = require('weekly');

configure(function(){
  set('root', __dirname);
  set('pagegen_uri', "http://www.gilt.com/pagegen_service/sale/sale_list");
  set('db', db);
  use(Static);
  this.server.port = 8888;
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
