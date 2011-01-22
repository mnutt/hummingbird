var TotalViewsMetric = {
  name: 'Total Views',
  initialData: {total: 0, cartAdds: 0},
  interval: 50, // ms
  incrementCallback: function(view) {
    this.data.total += 1;
    this.minuteData.total = (this.minuteData.total || 0) + 1;

    if(view.event() && view.event() === "cart_add") {
      this.data.cartAdds += 1;
      this.minuteData.cartAdds = (this.minuteData.cartAdds || 0) + 1;
    }
  }
};

for (var i in TotalViewsMetric)
  exports[i] = TotalViewsMetric[i];