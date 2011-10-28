var sys = require('sys');

var View = function(env) {
  if(!this instanceof View) {
    return new View(env);
  }

  this.env = env;
  if(this.env.events == "scAdd") {
    this.env.type = "cart_add";
  }

}

View.prototype = {
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

exports.View = View;
