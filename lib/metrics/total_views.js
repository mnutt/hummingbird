var TotalViewsMetric = {
  name: 'view_totals',
  initialData: 0,
  interval: 50, // ms
  incrementCallback: function(view) {
    this.data += 1;
    this.minuteData = (this.minuteData || 0) + 1;
  }
};

for (var i in TotalViewsMetric)
  exports[i] = TotalViewsMetric[i];