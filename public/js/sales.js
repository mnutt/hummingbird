if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.saleGraphs = {};

Hummingbird.getSales = function() {
  $.getJSON("/sale_list", function(data) {
    $.each(data.data.active_sales, function() {
      var editorialImage = "http://www.gilt.com" + this.sale_editorial_image;
      var name = this.name;
      var url = "http://www.gilt.com/s/" + this.url_key;

      var saleDiv = $("<div id='sale_" + this.url_key + "' class='sale'></div>");
      saleDiv.append("<img class='editorial' src='" + editorialImage + "'/>");
      saleDiv.append("<h2>" + name + "</h2>");

      var canvas = $("<canvas width='180' height='50'></canvas>");
      saleDiv.append(canvas);
      $("#sales").append(saleDiv);
      var saleGraph = new Hummingbird.Graph(saleDiv, { ratePerSecond: 2 });
      Hummingbird.saleGraphs[this.url_key] = saleGraph;
    });
  });
};

$(document).ready(function() {
  Hummingbird.getSales();
});