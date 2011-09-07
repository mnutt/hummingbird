if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.WebSocket = function() {
  this.state = "stopped";
};

Hummingbird.WebSocket.prototype = {

  // WebSocket callbacks
  onClose: function() {
    var self = this;
    if(this.getState() == "retrying") {
      // Wait a while to try restarting
      console.log("still no socket, retrying in 3 seconds");
      setTimeout(function() { self.start() }, 3000);
    } else {
      // First attempt at restarting, try immediately
      this.setState("retrying");
      console.log("socket lost, retrying immediately");
      setTimeout(function() { self.start() }, 200);
    }
  },

  onOpen: function() {
    this.setState("started");
    console.log("socket started");
  },

  // Hummingbird WebSocket functions
  getState: function() {
    return this.state;
  },

  setState: function(state) {
    this.state = state;
  },

  start: function() {
    // Functions that extract data and update UI elements
    this.handlers = [];

    this.socket = io.connect(this.webSocketURI(), {port: this.webSocketPort()});

    var self = this;

    this.socket.on('disconnect', function() { self.onClose(); });
    this.socket.on('connect', function() { self.onOpen(); });
  },

  webSocketEnabled: function() {
    if(!("WebSocket" in window)) {
      console.log("Sorry, the build of your browser does not support WebSockets. Please try latest Chrome or Webkit nightly");
      return false;
    }
    return true;
  },

  webSocketURI: function() {
    if(document.location.search.match(/ws_server/)) {
      var wsServerParam = document.location.search.match(/ws_server=([^\&\#]+)/) || [];
      var wsPortParam = document.location.search.match(/ws_port=([^\&\#]+)/) || [];
      var wsServer = wsServerParam[1];
    } else {
      var wsServer = document.location.hostname;
    }
    return wsServer;
  },

  webSocketPort: function() {
    if(document.location.search.match(/ws_server/)) {
      var wsPortParam = document.location.search.match(/ws_port=([^\&\#]+)/) || [];
      return wsPortParam;
    }
    return 8000;
  }
}

$.fn.hummingbirdGraph = function(socket, options) {
  if(this.length == 0) { return; }

  this.each(function() {
    new Hummingbird.WebSocket.Graph($(this), socket, options);
  });

  return this;
};
