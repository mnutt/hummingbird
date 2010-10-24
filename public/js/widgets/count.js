$.fn.hummingbirdCount = function(socket, options) {
  if(this.length == 0) { return; }

  this.each(function() {
    new Hummingbird.Count($(this), socket, options);
  });

  return this;
};


if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Count = function(element, socket, options) {
  this.element = element;
  this.socket = socket;

  var defaults = {
    averageOver: 1, // second
    ratePerSecond: 2,
    decimalPlaces: 0
  };

  this.options = $.extend(defaults, options);
  this.initialize();
};

Hummingbird.Count.prototype = new Hummingbird.Base();

$.extend(Hummingbird.Count.prototype, {
  name: "Count",
  onMessage: function(value, average) {
    this.element.text(average.toFixed(this.options.decimalPlaces));
  },
});
