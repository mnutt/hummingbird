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

Number.prototype.commify = function() {
  var strArray = this.toString().split('').reverse();
  var commas = [];
  for(var i = 0; i < strArray.length; i++) {
    if(i > 0 && i % 3 == 0) { commas.push(','); }
    commas.push(strArray[i]);
  }

  return commas.reverse().join('');
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

// Fix delay() to be stoppable...
(function($) {
  $.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
		type = type || "fx";

		return this.queue( type, function() {
			var elem = this;
			$(elem).data('delay_timer', setTimeout(function() {
				jQuery.dequeue( elem, type );
			}, time ));
		});
  };

  $.fn.stopDelay = function() {
    clearTimeout($(this).data('delay_timer'));
    return $(this);
  };
})(jQuery);


var console = window.console;
  if (!console) console = {log: function(){ }, error: function(){ }};

