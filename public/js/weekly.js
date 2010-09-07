if(!Hummingbird) { Hummingbird = {}; }

Hummingbird.Weekly = {};

Hummingbird.Weekly.weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

Hummingbird.Weekly.init = function() {
    var weekJson = "/week.json";
    if(document.location.search.match(/use_prod/)) {
      weekJson += "?use_prod";
    }

    $.getJSON(weekJson, function(data) {
      var dayTemplate = $("#day_template");

      var today = new Date();
      today.setUTCHours(0); today.setUTCMinutes(0); today.setUTCSeconds(0); today.setUTCMilliseconds(0);

      $.each(data, function() {
        var day = new Date(this.day);
        if(day.getTime() == today.getTime()) {
          var weekDay = "Today";
        } else {
          var weekDay = Hummingbird.Weekly.weekDays[day.getUTCDay()];
        }

        var dateDiv = dayTemplate.clone().attr('id', 'date_' + day.getTime()).attr('style', '');
        dateDiv.find('div.date_title').text(weekDay);
        if(this.total) {
          dateDiv.find('div.all_views').text(this.total.commify()).data('total', this.total);
        }

        dateDiv.appendTo('#days');
      });
    });
};

