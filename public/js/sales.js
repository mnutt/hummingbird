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

      var graph = $("<div class='hummingbird_graph'></div>");

      var canvas = $("<canvas width='185' height='70'></canvas>");
      graph.append(canvas);
      saleDiv.append(graph);
      $("#sales").append(saleDiv);
      var saleGraph = new Hummingbird.Graph(graph, { ratePerSecond: 2, initialScope: 200, backgroundImage: editorialImage, showBackgroundBars: false });
      Hummingbird.saleGraphs[this.url_key] = saleGraph;
    });
  });
};

$(document).ready(function() {
  Hummingbird.getSales();
});