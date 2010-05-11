if(!Hummingbird) { Hummingbird = {}; }

Hummingbird.Weekly = {};

Hummingbird.Weekly.weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

Hummingbird.Weekly.init = function() {
  $.getJSON("/sale_list", function(saleData) {
    saleData.data.active_sales.concat(saleData.data.upcoming_sales);
    var sales = {};
    $.each(saleData.data.active_sales, function() {
      sales[this.url_key] = this;
    });

    var weekJson = "/week.json";
    if(document.location.search.match(/use_prod/)) {
      weekJson += "?use_prod";
    }

    $.getJSON(weekJson, function(data) {
      var dayTemplate = $("#day_template");
      var saleTemplate = $("#sale_template");

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

        if(this.cartAdds) {
          dateDiv.find('div.cart_adds').text(this.cartAdds.commify()).data('cart_adds', this.cartAdds);
        }

        if(this.sales) {
          $.each(this.sales.slice(0, 4), function() {
            var saleDiv = saleTemplate.clone().attr('id', '').attr('style', '');
            var sale = sales[this.url_key];

            if (sale) {
              saleDiv.prepend("<img width='185' height='70' src='http://cdn1.gilt.com" + sale.featured_image_path + "'/>");
              saleDiv.find('div.sale_title').text(sale.name);
              saleDiv.find('div.sale_views').text(this.views);
              dateDiv.find('div.sales').append(saleDiv);
            }
          });
        }

        dateDiv.find('div.sales').append("<div style='clear: left;'></div>");

        dateDiv.appendTo('#days');
      });
    });
  });
};

