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
      var wsServer = "ws://" + wsServerParam[1] + ":" + (wsPortParam[1] || 8080);
    } else {
      var wsServer = "ws://" + document.location.hostname + ":8080";
    }
    return wsServer;
  }
}

// DASHBOARD WEBSOCKET

Hummingbird.WebSocket.Dashboard = function() { }
Hummingbird.WebSocket.Dashboard.prototype = new Hummingbird.WebSocket;

Hummingbird.WebSocket.Dashboard.prototype.start = function() {
  if (!this.webSocketEnabled())
    return;

  var totalDiv = $("#log");
  totalDiv.find('canvas').get(0).width = $(window).width() - 160;
  var totalGraph = new Hummingbird.Graph(totalDiv, { ratePerSecond: 20, logDate: true });

  var cartAdds = $("#cart_adds");;
  cartAdds.find('canvas').get(0).width = $(window).width() - 160;
  var cartAddsGraph = new Hummingbird.Graph(cartAdds, { ratePerSecond: 20 });

  var wsServer = this.webSocketURI();
  var ws = new WebSocket(wsServer);

  var self = this;

  ws.onmessage = function(evt) {
    var data = JSON.parse(evt.data);

    if(typeof(data.sales) != "undefined") {
      $.each(Hummingbird.saleGraphs, function(key) {
        if(data.sales[key]) {
          Hummingbird.saleGraphs[key].drawLogPath(data.sales[key]);
        } else {
          Hummingbird.saleGraphs[key].drawLogPath(0.0);
        }
      });
    } else if(typeof(data.total) != "undefined") {
      totalGraph.drawLogPath(data.total);
      if(data.cartAdds) {
        cartAddsGraph.drawLogPath(data.cartAdds);
      } else {
        cartAddsGraph.drawLogPath(0.0);
      }
    }
  }

  ws.onclose = function() { self.onclose(); }
  ws.onopen = function() { self.onopen(); }
}

// WEEKLY WEBSOCKET

Hummingbird.WebSocket.Weekly = function() { }
Hummingbird.WebSocket.Weekly.prototype = new Hummingbird.WebSocket;

Hummingbird.WebSocket.Weekly.prototype.start = function() {
  if (!this.webSocketEnabled())
    return;

  var wsServer = this.webSocketURI();
  var ws = new WebSocket(wsServer);

  var self = this;

  ws.onmessage = function(evt) {
    var data = JSON.parse(evt.data);
    if(data.total && data.total > 0) {
      var el = $("div.day:first-child div.all_views");
      var prevTotal = el.data("total");
      el.text((prevTotal + data.total).commify()).data('total', prevTotal + data.total);
    }
    if(data.cartAdds && data.cartAdds > 0) {
      var el = $("div.day:first-child div.cart_adds");
      var prevCartAdds = el.data("cart_adds");
      el.text((prevCartAdds + data.cartAdds).commify()).data('cart_adds', prevCartAdds + data.cartAdds);
    }
  };

  ws.onclose = function() { self.onclose(); }
  ws.onopen = function() { self.onopen(); }
}

