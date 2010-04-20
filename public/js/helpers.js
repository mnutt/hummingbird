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

// Custom sorting plugin
(function($) {
  $.fn.sorted = function(customOptions) {
    var options = {
      reversed: false,
      by: function(a) { return a.text(); }
    };
    $.extend(options, customOptions);
    $data = $(this);
    arr = $data.get();
    arr.sort(function(a, b) {
      var valA = options.by($(a));
      var valB = options.by($(b));
      if (options.reversed) {
        return (valA < valB) ? 1 : (valA > valB) ? -1 : 0;
      } else {
        return (valA < valB) ? -1 : (valA > valB) ? 1 : 0;
      }
    });
    return $(arr);
  };
})(jQuery);
