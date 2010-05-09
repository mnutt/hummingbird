var SalesMetric = {

  name: 'sales',

  initialData: { sales: {} },

  interval: 500, // ms

  incrementCallback: function(view) {
    if(view.urlKey()) {
      this.data.sales[view.urlKey()] = (this.data.sales[view.urlKey()] || 0) + 1;
      this.minuteData["sales."+view.urlKey()] = (this.minuteData["sales."+view.urlKey()] || 0) + 1;
    }
  },

  aggregateCallback: function(item) {
    item.tmpSales = item.sales;
    item.sales = [];
    for(sale in item.tmpSales) {
      if(item.tmpSales[sale] > 10) {
        item.sales.push({ url_key: sale,
                          views: item.tmpSales[sale] });
      }
    }
    delete item.tmpSales;

    // Sort by sale numbers descending
    item.sales = item.sales.sort(function(a, b) {
      if(a.views == b.views) {
        return 0;
      } else if(a.views > b.views) {
        return -1;
      } else { return 1; }
    });
  }

};

for (var i in SalesMetric)
  exports[i] = SalesMetric[i];