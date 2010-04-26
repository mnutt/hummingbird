require.paths.unshift('spec', './spec/lib', 'lib')
require.paths.unshift(__dirname + '/../lib');
require.paths.unshift(__dirname + '/..');

require('jspec')
require('unit/spec.helper')
hb = require('hummingbird')
http = require('http');
v = require('view');
m = require('metric');
sys = require('sys');
mongo = require('deps/node-mongodb-native/lib/mongodb');
db = new mongo.Db('hummingbird_test', new mongo.Server('localhost', 27017, {}), {});

MockRequest = function(url) {
  this.url = url;
}

MockResponse = function() {
  this.data = null;
  this.headers = null;
  this.statusCode = null;
  this.state = "open";
};

MockResponse.prototype = {
  writeHead: function(statusCode, headers) {
    this.statusCode = statusCode;
    this.headers = headers;
  },

  write: function(data, dataType) {
    this.data = data;
    this.dataType = dataType;
  },

  close: function() { this.end(); },

  end: function() {
    this.state = "closed";
  }
};

MockCollection = function() {
  this.inserts = [];
}

MockCollection.prototype = {
  insert: function(data) {
    this.inserts.push(data)
  }
}

db.open(function(p_db) {
  JSpec
    .exec('spec/unit/hummingbird_spec.js')
    .exec('spec/unit/view_spec.js')
    .exec('spec/unit/metric_spec.js')
    .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
    .report()
});
