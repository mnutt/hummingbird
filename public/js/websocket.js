if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.WebSocket = {};
Hummingbird.WebSocket.state = "stopped";
Hummingbird.WebSocket.start = function() {
  if(!("WebSocket" in window)) {
    console.log("Sorry, the build of your browser does not support WebSockets. Please use latest Chrome or Webkit nightly");
    return;
  }

  var totalDiv = $("#log");
  totalDiv.find('canvas').get(0).width = $(window).width() - 160;
  var totalGraph = new Hummingbird.Graph(totalDiv, { ratePerSecond: 20, logDate: true });

  var cartAdds = $("#cart_adds");;
  cartAdds.find('canvas').get(0).width = $(window).width() - 160;
  var cartAddsGraph = new Hummingbird.Graph(cartAdds, { ratePerSecond: 20 });

  if(document.location.search.match(/use_prod/)) {
    var wsServer = "ws://hummingbird.giltrunway.com:8080";
  } else {
    var wsServer = "ws://" + document.location.hostname + ":8080";
  }
  var ws = new WebSocket(wsServer);
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
  ws.onclose = function() {
    if(Hummingbird.WebSocket.state == "retrying") {
      // Wait a while to try restarting
      console.log("still no socket, retrying in 3 seconds");
      setTimeout(Hummingbird.WebSocket.start, 3000);
    } else {
      // First attempt at restarting, try immediately
      Hummingbird.WebSocket.state = "retrying";
      console.log("socket lost, retrying immediately");
      setTimeout(Hummingbird.WebSocket.start, 200);
    }
  };
  ws.onopen = function() {
    Hummingbird.WebSocket.state = "started";
    console.log("socket started");
    //alert("connected...");
  };
};

$(document).ready(function(){
  Hummingbird.WebSocket.start();
});
