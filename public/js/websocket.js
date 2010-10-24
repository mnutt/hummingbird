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

  onMessage: function(message) {
    var data = JSON.parse(message);
    var i = this.handlers.length;
    while(i--) {
      var handler = this.handlers[i][0];
      var scope = this.handlers[i][1];

      handler.apply(scope, [data]);
    }
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

    this.socket = new io.Socket(this.webSocketURI(), {port: this.webSocketPort()});
    this.socket.connect();

    var self = this;

    this.socket.on('message', function(message) { self.onMessage(message); });
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

  registerHandler: function(handler, object) {
    this.handlers.push([handler, object]);
  },

  unregisterHandler: function(handler) {
    for(var i = 0; i < this.handlers.length; i++) {
      if(this.handlers[i] === val) {
        this.handlers.splice(i, 1);
        break;
      }
    }
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

// DASHBOARD WEBSOCKET

Hummingbird.WebSocket.Dashboard = function() { }
Hummingbird.WebSocket.Dashboard.prototype = new Hummingbird.WebSocket;

Hummingbird.WebSocket.Dashboard.prototype.start = function() {
  this.socket = new io.Socket(this.webSocketURI(), {port: this.webSocketPort()});
  this.socket.connect();

  var totalDiv = $("#log");
  totalDiv.find('div.graph').width($(window).width() - 160);
  var totalGraph = new Hummingbird.Graph(totalDiv, { ratePerSecond: 20, logDate: true });

  var self = this;

  this.socket.on('message', function(msg) {
    var data = JSON.parse(msg);

    if(typeof(data.total) != "undefined") {
      totalGraph.drawLogPath(data.total);
    }
  })

  this.socket.on('disconnect', function() { self.onClose(); });
  this.socket.on('connect', function() { self.onOpen(); });
};

// WEEKLY WEBSOCKET

Hummingbird.WebSocket.Weekly = function() { }
Hummingbird.WebSocket.Weekly.prototype = new Hummingbird.WebSocket;

Hummingbird.WebSocket.Weekly.prototype.start = function() {
  if (!this.webSocketEnabled())
    return;

  this.socket = new io.Socket(this.webSocketURI(), {port: this.webSocketPort()});
  this.socket.connect();

  var self = this;

  this.socket.on('message', function(msg) {
    var data = JSON.parse(msg);
    if(data.total && data.total > 0) {
      var el = $("div.day:first-child div.all_views");
      var prevTotal = el.data("total");
      el.text((prevTotal + data.total).commify()).data('total', prevTotal + data.total);
    }
  });

  this.socket.on('disconnect', function() { self.onClose(); });
  this.socket.on('open', function() { self.onOpen(); });
}

