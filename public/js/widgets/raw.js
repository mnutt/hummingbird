if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Raw = function(element, socket, callback) {
  this.element = element;
  this.socket = socket;
  this.callback = callback;

  this.options = {};

  this.initialize();
};

Hummingbird.Raw.prototype = new Hummingbird.Base();

$.extend(Hummingbird.Raw.prototype, {
  name: "Raw",
  onMessage: function(message) {
    this.callback(message);
  },
});
