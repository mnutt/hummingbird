if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Graph = function(el, options) {
  if ( !(this instanceof Hummingbird.Graph) ) {
    return new Hummingbird.Graph(canvas);
  }

  var defaults = {
    showLogDate: false,
    showMarkers: true,
    ratePerSecond: 10,
    showBackgroundBars: true,
    barColor: null
  }

  this.options = $.extend(defaults, options);

  this.scale = 800;
  this.el = $(el);
  this.canvas = $(el).find('canvas').get(0);
  this.valueElement = this.el.find('span.value');
  this.trafficLog = [];

  this.init();
};

Hummingbird.Graph.prototype = {
  init: function() {
    this.setupContext();

    this.lineColors = {
      1600: "#FFF",
      800: "#983839",
      400: "#C44939",
      200: "#F1E29F",
      100: "#7BE4D6",
      50: "#65B88A",
      25: "#5BC4B6",
      12.5: "#3BA496",
      6.25: "#1B8476",
      3.125: "#006456",
      def: "#7BF4D6"
    };
    this.bgLineColor = "#555";
    this.canvasHeight = $(this.canvas).height();
    this.canvasWidth = $(this.canvas).width();

    this.numMarkers = Math.floor(this.canvasHeight / 23);
    this.resetMarkers();

    this.lineWidth = 3;

    // this.drawEmptyGraph();
    this.tick = 0;
  },

  resetMarkers: function() {
    var leftMarkerContainer = this.el.find('div.axis_left');
    var rightMarkerContainer = this.el.find('div.axis_right');

    if(leftMarkerContainer.length == 0) { return; }

    leftMarkerContainer.html('');
    rightMarkerContainer.html('');

    var incr = this.scale / this.numMarkers;
    for(var i = 0; i <= this.numMarkers; i++) {
      var markerValue = Math.floor(this.scale - (i * incr));
      leftMarkerContainer.append('<p>' + markerValue + '</p>');
      rightMarkerContainer.append('<p>' + markerValue + '</p>');
    }
  },

  addValue: function(value) {
    this.trafficLog.push(value);
    if(this.trafficLog.length > this.options.ratePerSecond) {
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

    this.context.font = "bold 10px Andale Mono, sans-serif";
    this.context.textAlign = "right";
  },

  runningAverage: function() {
    return this.trafficLog.sum() * 1.0 / this.trafficLog.length;
  },

  drawEmptyGraph: function() {
    var dataPoints = Math.ceil(this.canvasWidth / (this.lineWidth * 2))
    while(dataPoints--) {
      this.drawLogPath(0);
    }
  },

  logDate: function() {
    // Draw text background
    this.context.lineCap = "round";
    this.context.lineWidth = 12;
    this.context.beginPath();
    this.context.moveTo(this.canvasWidth - 16, this.canvasHeight + 10);
    this.context.strokeStyle = "#000";
    this.context.lineTo(this.canvasWidth - 70, this.canvasHeight + 10);
    this.context.stroke();
    this.context.closePath();
    this.context.lineCap = "square";

    // Draw date text
    this.context.fillStyle = "#FFF";
    var date = new Date();

    this.context.fillText(date.formattedTime(), this.canvasWidth - 16, this.canvasHeight + 14);
  },

  rescale: function(percent) {
    var oldScale = this.scale;

    if(percent == 0) { return; }
    if(percent > 0.9) {
      this.scale = this.scale * 2;
    } else if(percent < 0.08) {
      this.scale = this.scale / 4;
    } else if(percent < 0.16) {
      this.scale = this.scale / 2;
    } else {
      return;
    }

    this.drawSeparator(percent, oldScale, this.scale);
    this.resetMarkers();
  },

  drawSeparator: function(percent, oldScale, newScale) {
    this.shiftCanvas(this.lineWidth * 2, 0);
    var newHeight = percent * this.canvasHeight;
    var oldHeight = percent * (oldScale/newScale) * this.canvasHeight;

    this.context.lineWidth = this.lineWidth;
    this.context.beginPath();
    this.context.strokeStyle = "#CCC";
    this.context.moveTo(this.canvasWidth - 10, this.canvasHeight - oldHeight);
    this.context.lineTo(this.canvasWidth - 10, this.canvasHeight - newHeight);
    this.context.stroke();
    this.context.closePath();
  },

  drawLogPath: function(value) {
    this.tick++;

    if(this.options.showLogDate) {

      if(this.tick % 100 == 0) {
        this.logDate();
      }
    }

    this.addValue(value);

    var average = this.runningAverage() * this.options.ratePerSecond;
    var percent = average / this.scale;
    var height = Math.max(percent * this.canvasHeight, 1);
    var color = this.options.barColor || this.lineColors[this.scale] || this.lineColors.def;
    var endingPoint = this.canvasHeight - height;

    this.shiftCanvas(this.lineWidth * 2, 0);
    this.context.lineWidth = this.lineWidth;
    this.context.beginPath();
    this.context.strokeStyle = color;
    this.context.moveTo(this.canvasWidth - 10, this.canvasHeight);
    this.context.lineTo(this.canvasWidth - 10, endingPoint);
    this.context.stroke();
    this.context.closePath();

    if(this.options.showBackgroundBars) {
      this.context.beginPath();
      this.context.strokeStyle = this.bgLineColor;
      this.context.moveTo(this.canvasWidth - 10, endingPoint);
      this.context.lineTo(this.canvasWidth - 10, 0);
      this.context.stroke();
      this.context.closePath();
    }

    if(this.tick % (this.options.ratePerSecond * 2) == 0) { // Every 2 seconds
      this.valueElement.text(average);
      this.el.attr('data-average', average);

      this.rescale(percent);

      if(this.tick % 1000 == 0) { this.tick = 0; }
    }
  }
};
