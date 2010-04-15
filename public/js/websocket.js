if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.WebSocket = {};
Hummingbird.WebSocket.state = "stopped";
Hummingbird.WebSocket.start = function() {
  if(!("WebSocket" in window)) {
    console.log("Sorry, the build of your browser does not support WebSockets. Please use latest Chrome or Webkit nightly");
    return;
  }

  var canvas = $("#log").get(0);
  canvas.width = $(window).width() - 160;
  var totalGraph = new Hummingbird.Graph(canvas);

  var ws = new WebSocket("ws://" + document.location.hostname + ':8080');
  ws.onmessage = function(evt) {
    var data = JSON.parse(evt.data);

    if(typeof(data.sales) != "undefined") {
      $.each(Hummingbird.saleGraphs, function(key) {
        if(data.sales[key]) {
          Hummingbird.saleGraphs[key].drawLogPath(data.sales[key] / 200.0);
        } else {
          Hummingbird.saleGraphs[key].drawLogPath(0.0);
        }
      });
    } else if(typeof(data.total) != "undefined") {
      totalGraph.drawLogPath(data.total * 20 / 4000.0);
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