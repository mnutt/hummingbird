var CartAddsMetric = {
  name: 'cart_adds',
  initialData: 0,
  interval: 50, // ms
  incrementCallback: function(view) {
    if(view.event() && view.event() === "cart_add") {
      this.data += 1;
      this.minuteData = (this.minuteData || 0) + 1;
    }
  }
}

for (var i in CartAddsMetric)
  exports[i] = CartAddsMetric[i];
