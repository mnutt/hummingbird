var HitsMetric = {
  name: 'Individual Hits',
  initialData: [],
  interval: 200,
  incrementCallback: function(view) {
    var value = {
      url: view.env.u,
      timestamp: view.env.timestamp,
      ip: view.env.ip
    };
    this.data.push(value);
  }
}

for (var i in HitsMetric)
  exports[i] = HitsMetric[i];