if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Logger = function(element, socket, options) {
  this.element = element;
  this.socket = socket;

  var defaults = {
    averageOver: 60, // seconds
    ratePerSecond: 1,
    decimalPlaces: 1
  };

  this.options = $.extend(defaults, options);
  this.initialize();
};

Hummingbird.Logger.prototype = new Hummingbird.Base();

$.extend(Hummingbird.Logger.prototype, {
  name: "Logger",
  onMessage: function(message, average) {
    console.log("Minute Average: " + average.toFixed(this.options.decimalPlaces));
  }
});
