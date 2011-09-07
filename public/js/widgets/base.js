if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Base = function() {};

Hummingbird.Base.prototype = {

  messageCount: 0,

  messageRate: 20,

  initialize: function() {
    this.averageLog = [];
    this.registerHandler();
  },

  registerHandler: function() {
    var self = this;
    this.socket.on(this.options.from, function(data) {
      self.onData.apply(self, [data]);
    });
  },

  onMessage: function(message) {
    console.log("Base class says: " + JSON.stringify(message));
  },

  onData: function(message) {
    var average;

    this.messageCount += 1;

    // Calculate the average over N seconds if the averageOver option is set
    if(this.options.averageOver && typeof(message) == "number") { average = this.addToAverage(message); }

    if((!this.options.every) || (this.messageCount % this.options.every == 0)) {
      this.onMessage(message, this.average());
    }
  },

  addToAverage: function(newValue) {
    var averageCount = this.options.averageOver * this.messageRate;

    this.averageLog.push(newValue);
    if(this.averageLog.length > averageCount) {
      this.averageLog.shift();
    }
  },

  average: function() {
    if(this.averageLog.length == 0) { return 0; }

    return this.averageLog.sum() * 1.0 / this.averageLog.length * this.messageRate;
  }

};
