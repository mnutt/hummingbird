var SalesMetric = {
  name: 'sales',
  defaultData: {sales: {}},
  interval: 500,
  addValueCallback: function(view) {
    if(view.urlKey()) {
      if(this.data.sales[view.urlKey()]) {
        this.data.sales[view.urlKey()] += 1;
      } else {
        this.data.sales[view.urlKey()] = 1;
      }

      if(this.minuteData.sales[view.urlKey()]) {
        this.minuteData.sales[view.urlKey()] += 1;
      } else {
        this.minuteData.sales[view.urlKey()] = 1;
      }

    }
  }
};

for (var i in SalesMetric)
  exports[i] = SalesMetric[i];