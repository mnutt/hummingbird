if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Logger = function(element, socket, options) {
  this.element = element;
  this.socket = socket;

  var defaults = {
    averageOver: 60, // seconds
    decimalPlaces: 1
  };

  this.options = $.extend(defaults, options);
  this.initialize();
};

Hummingbird.Logger.prototype = new Hummingbird.Base();

$.extend(Hummingbird.Logger.prototype, {
  name: "Logger",
  onMessage: function(message, average) {
    var value = average * this.updatesPerSecond() * this.options.timeUnit;
    var displayValue = value.toFixed(this.options.decimalPlaces);
    console.log("Average: " + displayValue + " per " + this.options.timeUnit + "s");
  }
});
