Array.prototype.sum = function() {
  return (! this.length) ? 0 : this.slice(1).sum() +
    ((typeof this[0] == 'number') ? this[0] : 0);
};

Date.prototype.formattedTime = function() {
  var formattedDate = this.getHours();

  var minutes = this.getMinutes();
  if(minutes > 9) {
    formattedDate += ":" + minutes;
  } else {
    formattedDate += ":0" + minutes;
  }

  var seconds = this.getSeconds();
  if(seconds > 9) {
    formattedDate += ":" + seconds;
  } else {
    formattedDate += ":0" + seconds;
  }

  return formattedDate;
};