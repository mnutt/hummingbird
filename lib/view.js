var sys = require('sys');

var View = function(env) {
  if(!this instanceof View) {
    return new View(env);
  }

  this.env = env;
}

View.prototype = {
  urlKey: function() {
    if(this.env.u) {
      var match = View.urlKeyRegexp.exec(this.env.u);
      if(match && match.length > 0) {
        this._urlKey = match[1];
      }
    }

    this.urlKey = function() { return this._urlKey; }
    return this._urlKey;
  },

  productId: function() {
    if(this.env.u) {
      var match = View.productIdRegexp.exec(this.env.u);
      if(match && match.length > 0) {
        this._productId = parseInt(match[1]);
      }
    }

    this.productId = function() { return this._productId; }
    return this._productId;
  },

  event: function() {
    if(this.env.events) {
      if(this.env.events.match(/scAdd/)) {
        this._event = "cart_add";
      } else if(this.env.events === "purchase") {
        this._event = "purchase";
      }
    }

    this.event = function() { return this._event; }
    return this._event;
  }
};

View.urlKeyRegexp = new RegExp(/^http:\/\/[^\/]+\/s\/([^\/]+)\/?/);
View.productIdRegexp = new RegExp(/\/product\/([0-9]+)/);

exports.View = View;
