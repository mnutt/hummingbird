var View = function(env) {
  if(!this instanceof View) {
    return new View(env);
  }

  this.env = env;
  if(this.env.u) {
    var match = this.env.u.match(/^http:\/\/[^\/]+\/s\/([^\/]+)/);
    if(match && match.length > 0) {
      this.urlKey = match[1];
    }
  }
}

View.prototype = {
};

exports.View = View;
