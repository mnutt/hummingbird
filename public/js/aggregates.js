if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Aggregates = {};
Hummingbird.Aggregates.state = "stopped";
Hummingbird.Aggregates.start = function() {
  if(!("WebSocket" in window)) {
    console.log("Sorry, the build of your browser does not support WebSockets. Please use latest Chrome or Webkit nightly");
    return;
  }

  var lastHourDiv = $("#pageviews_last_hour");
  lastHourDiv.find('canvas').get(0).width = $(window).width() - 160;
  var lastHourGraph = new Hummingbird.Graph(lastHourDiv, { ratePerSecond: 20, logDate: true });

  var wsServer = "ws://" + document.location.hostname + ":8080/aggregates";
  var ws = new WebSocket(wsServer);

  ws.onmessage = function(evt) {
    var data = JSON.parse(evt.data);

    if (typeof(data.metric) != "undefined") {
      var values = data.values;
      $.each(values, function(idx, visit) {
        lastHourGraph.drawLogPath(visit);
        lastHourGraph.drawLogPath(visit);
        lastHourGraph.drawLogPath(visit);
      });
    }
  }
  ws.onclose = function() {
    if(Hummingbird.Aggregates.state == "retrying") {
      // Wait a while to try restarting
      console.log("still no socket, retrying in 3 seconds");
      setTimeout(Hummingbird.Aggregates.start, 3000);
    } else {
      // First attempt at restarting, try immediately
      Hummingbird.Aggregates.state = "retrying";
      console.log("socket lost, retrying immediately");
      setTimeout(Hummingbird.Aggregates.start, 200);
    }
  };
  ws.onopen = function() {
    Hummingbird.Aggregates.state = "started";
    console.log("socket started");
  };
  Hummingbird.Aggregates.ws = ws;
};

$(document).ready(function(){
  Hummingbird.Aggregates.start();
});
