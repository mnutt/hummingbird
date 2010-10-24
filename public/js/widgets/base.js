if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Base = function() {};

Hummingbird.Base.prototype = {

  initialize: function() {
    this.setFilter();
    this.registerHandler();
  },

  registerHandler: function() {
    this.socket.registerHandler(this.onData, this);
  },

  onMessage: function(message) {
    console.log("Base class says: " + JSON.stringify(message));
  },

  onData: function(fullData) {
    var message = this.extract(fullData);
    if(typeof(message) != "undefined") {
      this.onMessage(message);
    }
  },

  extract: function(data) {
    if(typeof(data) == "undefined") { return; }

    var obj = data;
    for(var i = 0, len = this.filter.length; i < len; i++) {
      obj = obj[this.filter[i]];
      if(typeof(obj) == "undefined") { return; }
    }

    return obj;
  },

  setFilter: function() {
    var obj = this.options.data;

    this.filter = [];

    while(typeof(obj) == "object") {
      for(var i in obj) {
        this.filter.push(i);
        obj = obj[i];
        break;
      }
    }
  }

};
