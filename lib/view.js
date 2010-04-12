var View = function(env) {
  if(!this instanceof View) {
    return new View(env);
  }

  this.env = env;
  this.urlKey = this.env.u.match(/^http:\/\/[^\/]+\/s\/([^\/]+)/)[1];
}

View.prototype = {
};

exports.View = View;