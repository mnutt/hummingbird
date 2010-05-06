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
        dateDiv.find('div.all_views').text(this.total.commify()).data('total', this.total);
        dateDiv.find('div.cart_adds').text(this.cartAdds.commify()).data('cart_adds', this.cartAdds);;

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
        dateDiv.find('div.sales').append("<div style='clear: left;'></div>");

        dateDiv.appendTo('#days');
      });
    });
  });

  if(document.location.search.match(/use_prod/)) {
    var wsServer = "ws://hummingbird.giltrunway.com:8080";
  } else {
    var wsServer = "ws://" + document.location.hostname + ":8080";
  }
  var ws = new WebSocket(wsServer);
  ws.onmessage = function(evt) {
    var data = JSON.parse(evt.data);
    if(data.total && data.total > 0) {
      var el = $("div.day:first-child div.all_views");
      var prevTotal = el.data("total");
      el.text((prevTotal + data.total).commify()).data('total', prevTotal + data.total);
    }
    if(data.cartAdds && data.cartAdds > 0) {
      var el = $("div.day:first-child div.cart_adds");
      var prevCartAdds = el.data("cart_adds");
      el.text((prevCartAdds + data.cartAdds).commify()).data('cart_adds', prevCartAdds + data.cartAdds);
    }
  };
  ws.onclose = function() {
    if(Hummingbird.WebSocket.state == "retrying") {
      // Wait a while to try restarting
      console.log("still no socket, retrying in 3 seconds");
      setTimeout(Hummingbird.WebSocket.start, 3000);
    } else {
      // First attempt at restarting, try immediately
      Hummingbird.WebSocket.state = "retrying";
      console.log("socket lost, retrying immediately");
      setTimeout(Hummingbird.WebSocket.start, 200);
    }
  };
};

