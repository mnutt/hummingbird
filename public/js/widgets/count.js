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
  this.options = options;

  this.initialize();
};

Hummingbird.Count.prototype = new Hummingbird.Base();

$.extend(Hummingbird.Count.prototype, {
  onMessage: function(message) {
    this.element.text(message);
  }
});
