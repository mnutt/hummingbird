var SalesMetric = {

  name: 'sales',

  initialData: { sales: {} },

  interval: 500, // ms

  incrementCallback: function(view) {
    if(view.env.u) {
      var match = view.env.u.match(/^http:\/\/[^\/]+(\/s\/|\/sale\/splash\/|\/city\/offers?\/)([^\/\?\#]+)\/?(product\/)?(\d+)?/);
      if(match && match.length > 2) {
        view.urlKey = match[2];
        view.productId = match[4];
      }
    }

    if(view.urlKey) {
      this.data.sales[view.urlKey] = (this.data.sales[view.urlKey] || 0) + 1;
      this.minuteData["sales."+view.urlKey] = (this.minuteData["sales."+view.urlKey] || 0) + 1;
    }
  },
};

for (var i in SalesMetric)
  exports[i] = SalesMetric[i];