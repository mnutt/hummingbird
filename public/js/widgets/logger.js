if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Logger = function(element, socket, options) {
  this.element = element;
  this.socket = socket;
  this.options = options;

  this.initialize();
};

Hummingbird.Logger.prototype = new Hummingbird.Base();

Hummingbird.Logger.prototype.onMessage = function(message) {
  console.log("Logger: " + JSON.stringify(message));
};
