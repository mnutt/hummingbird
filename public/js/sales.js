if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.saleGraphs = {};

Hummingbird.getSales = function() {
  $.getJSON("/sale_list", function(data) {
    data.data.active_sales.concat(data.data.upcoming_sales);
    $.each(data.data.active_sales, function() {
      var editorialImage = "http://www.gilt.com" + this.sale_editorial_image;
      var name = this.name;
      var url = "http://www.gilt.com/s/" + this.url_key;

      var saleDiv = $("<div id='sale_" + this.url_key + "' data-id='" + this.url_key + "' class='sale'></div>");
      saleDiv.append("<img class='editorial' src='" + editorialImage + "'/>");
      saleDiv.append("<h2>" + name + "</h2>");

      var graph = $("<div class='hummingbird_graph'></div>");
      graph.append("<div class='req_s'><span class='value'>0</span> pages/sec</div>");

      var canvas = $("<canvas width='185' height='70'></canvas>");
      graph.append(canvas);
      saleDiv.append(graph);
      $("#sales").append(saleDiv);
      var saleGraph = new Hummingbird.Graph(graph, { ratePerSecond: 2, initialScope: 200, backgroundImage: editorialImage, showBackgroundBars: false });
      Hummingbird.saleGraphs[this.url_key] = saleGraph;
    });

    var canvasWidth = $("#log canvas").width() - 8;
    var salesPerRow = Math.floor(canvasWidth / 190);
    var extraSpace = canvasWidth % 190;
    var extraSpacePerSale = (extraSpace + 10) / (salesPerRow - 1);

    $("#sales div.sale").css({marginRight: extraSpacePerSale + 10});
    $("body").css({minWidth: $("#log").width()});
  });
};

Hummingbird.resortSales = function() {
  var sortedSales = $("div#sales div.sale").sorted({
    by: function(a) {
      return parseFloat(a.find('div.hummingbird_graph').attr('data-average')) || -1;
    }
  });

  $.each(sortedSales, function() {
    $(this).prependTo("div#sales");
  });
};