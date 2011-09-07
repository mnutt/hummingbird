require('jspec')
require('./unit/spec.helper')
hb = require('../lib/hummingbird')
http = require('http');
v = require('../lib/view');
m = require('../lib/metric');
sys = require('sys');
mongo = require('mongodb');
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
  insertAll: function(docs) {
    for(var i = 0; i < docs.length; i++) {
      this.inserts.push(docs[i])
    }
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
