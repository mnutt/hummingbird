if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Graph = function(canvas, options) {
  if ( !(this instanceof Hummingbird.Graph) ) {
    return new Hummingbird.Graph(canvas);
  }

  this.options = options || {};

  this.canvas = canvas;
  this.trafficLog = [];

  this.init();
};

Hummingbird.Graph.prototype = {
  init: function() {
    this.setupContext();

    this.lineColors = [ "#FFFFFF", "#3BA496", "#65B88A",
                        "#F1E29F", "#C44939", "#983839" ];
    this.bgLineColor = "#555";
    this.canvasHeight = $(this.canvas).height() - 15;
    this.canvasWidth = $(this.canvas).width();

    this.lineWidth = 3;

    this.drawEmptyGraph();
    this.tick = 0;
  },

  addValue: function(value) {
    this.trafficLog.push(value);
    if(this.trafficLog.length > 20) {
      this.trafficLog.shift();
    }
  },

  shiftCanvas: function(x, y) {
    this.context.putImageData(this.context.getImageData(x, y, this.canvas.width, this.canvas.height), 0, 0);
  },

  setupContext: function() {
    if(this.canvas.getContext) {
      this.context = this.canvas.getContext('2d');
    } else {
      alert("Sorry, this browser doesn't support canvas");
    }

    this.context.font = "10px Lucida Grande";
    this.context.textAlign = "right";
  },

  runningAverage: function() {
    return this.trafficLog.sum() / this.trafficLog.length;
  },

  drawEmptyGraph: function() {
    var dataPoints = Math.ceil(this.canvasWidth / 6)
    while(dataPoints--) {
      this.drawLogPath(0);
    }
  },

  logDate: function() {
    // Draw text background
    this.context.lineCap = "round";
    this.context.lineWidth = 12;
    this.context.beginPath();
    this.context.moveTo(this.canvasWidth - 16, this.canvasHeight + 8);
    this.context.strokeStyle = "#000";
    this.context.lineTo(this.canvasWidth - 70, this.canvasHeight + 8);
    this.context.stroke();
    this.context.closePath();

    // Draw date text
    this.context.fillStyle = "#FFF";
    var date = new Date();

    this.context.fillText(date.formattedTime(), this.canvasWidth - 20, this.canvasHeight + 12);
  },

  drawLogPath: function(percent) {
    if(this.options.logDate) {
      this.tick++;

      if(this.tick % 100 == 0) {
        this.logDate();
        this.tick = 0;
      }
    }

    this.addValue(percent);

    var average = this.runningAverage();
    var height = Math.max(average * this.canvasHeight, 1);
    var colorIndex = Math.min(Math.ceil((average / 2) * 10), 5);
    var color = this.lineColors[colorIndex];
    var endingPoint = this.canvasHeight - height;

    this.shiftCanvas(this.lineWidth * 2, 0);
    this.context.lineWidth = this.lineWidth;
    this.context.beginPath();
    this.context.strokeStyle = color;
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
