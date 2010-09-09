if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.WebSocket = function() {
  this.state = "stopped";
};

Hummingbird.WebSocket.prototype = {
  // WebSocket callbacks
  onclose: function() {
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

  onopen: function() {
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
    console.log("start() not implemented");
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

  this.socket.on('disconnect', function() { self.onclose(); });
  this.socket.on('connect', function() { self.onopen(); });
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

  this.socket.on('disconnect', function() { self.onclose(); });
  this.socket.on('open', function() { self.onopen(); });
}

