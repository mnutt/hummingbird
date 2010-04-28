var sys = require('sys');

var View = function(env) {
  if(!this instanceof View) {
    return new View(env);
  }

  this.env = env;

  if(this.env.u) {
    var match = View.urlKeyRegexp.exec(this.env.u);
    if(match && match.length > 2) {
      this._urlKey = match[2];
      this._productId = parseInt(match[4]);
    }
  }
}

View.prototype = {
  urlKey: function() {
    return this._urlKey;
  },

  productId: function() {
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

View.urlKeyRegexp = new RegExp(/^http:\/\/[^\/]+(\/s\/|\/sale\/splash\/)([^\/\?\#]+)\/?(product\/)?(\d+)?/);

exports.View = View;
