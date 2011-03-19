$.fn.hummingbirdMap = function(socket, options) {
  if(this.length == 0) { return; }

  this.each(function() {
    new Hummingbird.Map($(this), socket, options);
  });

  return this;
};

if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Map = function(element, socket, options) {
  this.element = element;
  this.socket = socket;

  this.po = org.polymaps;

  this.map = this.po.map()
    .container(this.element.get(0).appendChild(this.po.svg("svg")))
    .center({lat: 39, lon: 10})
    .zoom(2)
    .zoomRange([2, 9])
    .add(this.po.interact());

  this.map.add(this.po.image()
          .url(this.po.url("http://{S}tile.cloudmade.com"
                      + "/e5db7ff94b054de799146f983c9c4a70"
                      + "/26332/256/{Z}/{X}/{Y}.png")
               .hosts(["a.", "b.", "c.", ""])));

  this.map.add(this.po.fullscreen());

  this.map.add(this.po.compass()
          .pan("none"));


  var defaults = {
    averageOver: 1, // second
    ratePerSecond: 2,
    decimalPlaces: 0
  };

  this.options = $.extend(defaults, options);
  this.initialize();
};


Hummingbird.Map.prototype = new Hummingbird.Base();

$.extend(Hummingbird.Map.prototype, {
  name: "Map",
  onMessage: function(value, average) {
    if(value && value.length > 0) {
      for(var i in value) {
        var geo = value[i];
        if(typeof(geo.latitude) == "undefined") { continue; }

        this.addMarker(parseFloat(geo.longitude), parseFloat(geo.latitude), 10, geo.city);
      }
    }
  },

  addMarker: function(lon, lat, radius, text) {
    var id = ("mark_" + lon + "_" + lat).replace(/[^0-9a-z_]/g, '');

    var existing = $("#" + id);
    if(existing.length == 0) {
      // If marker doesn't exist, create it
      var geometry = {
        coordinates: [lon, lat],
        type: "Marker",
        id: id,
        radius: radius,
        text: text || ""
      };

      this.map.add(this.po.geoJson().features([{ geometry: geometry }]));
      existing = $("#" + id);
    } else {
      // Stop the current animation queue and set opacity back to 1
      existing.stop(true).stopDelay().css({ opacity: 1 });
    }

    // After 4 seconds, fade marker out then remove the whole layer
    existing.delay(4000).animate({ opacity: 0 }, 1000, function() {
      $(this).parent().parent().parent().remove();
    });
  }
});
