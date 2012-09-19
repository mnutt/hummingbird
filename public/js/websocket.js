if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.WebSocket = function(url, token) {
  this.url = url;
  this.token = token;
  this.state = "stopped";
  this.handlers = [];
  this.emitted = [];
};

Hummingbird.WebSocket.prototype = {
  // WebSocket callbacks
  onClose: function() {
    var self = this;
    if(this.state == "retrying") {
      // Wait a while to try restarting
      console.log("still no socket, retrying in 3 seconds");
      setTimeout(function() { self.connect() }, 3000);
    } else {
      // First attempt at restarting, try immediately
      this.state = "retrying";
      console.log("socket lost, retrying immediately");
      setTimeout(function() { self.connect() }, 200);
    }
  },

  onOpen: function() {
    console.log("socket started");

    this.state = "started";
    if(this.token) {
      this.socket.emit("auth", this.token);
    } else {
      this.onAuth(true);
    }
  },

  onAuth: function(isAuthed) {
    if(!isAuthed) {
      console.log("socket auth failure");
      return;
    }

    console.log("socket authed");
    this.state = "authed";

    while(this.handlers.length) {
      var handler = this.handlers.shift();
      this.socket.on(handler[0], handler[1]);
    }

    // We assume that all 'emit' events are room joins, so don't
    // clear them out so that we can send them again in case the
    // socket needs to reconnect
    for(var i = 0; i < this.emitted.length; i++) {
      var emitEvent = this.emitted[i];
      this.socket.emit.apply(this.socket, emitEvent);
    }
  },

  join: function(metric) {
    this.emit("join", metric);
  },

  on: function(event, callback) {
    if(this.socket) {
      this.socket.on(event, callback);
    } else {
      this.handlers.push([event, callback]);
    }
  },

  emit: function(event) {
    if(this.socket && this.state == 'authed') {
      this.socket.emit.apply(this.socket, arguments);
    } else {
      this.emitted.push(arguments);
    }
  },

  connect: function() {
    console.log(this.url);
    this.socket = io.connect(this.url);

    var _this = this;

    this.socket.removeAllListeners();
    this.socket.once('disconnect', function() { _this.onClose(); });
    this.socket.once('connect', function() { _this.onOpen(); });
    this.socket.once('auth', function(isAuthed) {  _this.onAuth(isAuthed); });
    return this.socket;
  },

  disconnect: function() {
    this.socket.disconnect();
  }
}
