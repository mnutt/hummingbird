if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Graph = function(canvas) {
  if ( !(this instanceof Hummingbird.Graph) ) {
    return new Hummingbird.Graph(canvas);
  }

  this.canvas = canvas;
  this.trafficLog = [];

  this.init();
};

Hummingbird.Graph.prototype = {
  init: function() {
    this.setupContext();

    this.lineColor = "#FFF";
    this.bgLineColor = "#555";
    this.canvasHeight = $(this.canvas).height();
    this.canvasWidth = $(this.canvas).width();
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
    var height = Math.max(this.runningAverage() * this.canvasHeight, 1);
    var endingPoint = this.canvasHeight - height;

    this.shiftCanvas(6, 0);
    this.context.beginPath();
    this.context.strokeStyle = this.lineColor;
    this.context.moveTo(this.canvasWidth - 10, this.canvasHeight);
    this.context.lineTo(this.canvasWidth - 10, endingPoint);
    this.context.stroke();
    this.context.closePath();

    this.context.beginPath();
    this.context.strokeStyle = this.bgLineColor;
    this.context.moveTo(this.canvasWidth - 10, endingPoint);
    this.context.lineTo(this.canvasWidth - 10, 0);
    this.context.stroke();
    this.context.closePath();
  }
};
