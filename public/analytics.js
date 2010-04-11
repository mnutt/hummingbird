if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Graph = function(canvas, url) {
  if ( !(this instanceof Hummingbird.Graph) ) {
    return new Hummingbird.Graph(canvas, url);
  }

  this.url = url;
  this.canvas = canvas;
  this.trafficLog = [];

  this.init();
};

Hummingbird.Graph.prototype = {
  init: function() {
    this.setupContext();

    this.ws = new WebSocket(this.url);
    this.ws.onmessage = $.proxy(function(evt) {
      this.drawLogPath(evt.data * 20 / 4000.0);
    }, this);
    this.ws.onclose = function() {
      alert("socket closed");
    };
    this.ws.onopen = function() {
      //alert("connected...");
    };
  },

  addValue: function(value) {
    this.trafficLog.push(value);
    if(this.trafficLog.length > 20) {
      this.trafficLog.shift();
    }
  },

  shiftCanvas: function(x, y) {
    var canvasData = this.context.getImageData(x, y, this.canvas.width, this.canvas.height);
    this.context.putImageData(canvasData, 0, 0);
  },

  setupContext: function() {
    if(this.canvas.getContext) {
      this.context = this.canvas.getContext('2d');
    } else {
      alert("Sorry, this browser doesn't support canvas");
    }

    this.context.lineWidth = 3;
  },

  runningAverage: function() {
    return this.trafficLog.sum() / this.trafficLog.length;
  },

  drawLogPath: function(percent) {
    this.addValue(percent);
    var height = Math.max(this.runningAverage() * 400, 1);
    var endingPoint = 400 - height;

    this.shiftCanvas(6, 0);
    this.context.beginPath();
    this.context.strokeStyle = '#FF1438';
    this.context.moveTo(750, 400);
    this.context.lineTo(750, endingPoint);
    this.context.stroke();
    this.context.closePath();

    this.context.beginPath();
    this.context.strokeStyle = '#C7F8FF';
    this.context.moveTo(750, endingPoint);
    this.context.lineTo(750, 0);
    this.context.stroke();
    this.context.closePath();
  }
};
