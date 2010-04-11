Array.prototype.sum = function() {
  return (! this.length) ? 0 : this.slice(1).sum() +
    ((typeof this[0] == 'number') ? this[0] : 0);
};
