var SalesMetric = {
  name: 'sales',
  defaultData: {sales: {}},
  interval: 500, // ms
  addValueCallback: function(view) {
    if(view.urlKey()) {
      this.data.sales[view.urlKey()] = (this.data.sales[view.urlKey()] || 0) + 1;
      this.minuteData.sales[view.urlKey()] = (this.minuteData.sales[view.urlKey()] || 0) + 1;
    }
  }
};

for (var i in SalesMetric)
  exports[i] = SalesMetric[i];