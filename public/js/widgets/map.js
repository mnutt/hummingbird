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
    .container(this.element.find("svg").get(0))
    .center({lat: 39, lon: -96})
    .zoom(4)
    .zoomRange([3, 9])
    .add(this.po.interact());

  this.map.add(this.po.image()
          .url(this.po.url("http://{S}tile.cloudmade.com"
                      + "/e5db7ff94b054de799146f983c9c4a70"
                      + "/20760/256/{Z}/{X}/{Y}.png")
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

        this.map.add(this.po.geoJson().features([{geometry: { coordinates: [parseFloat(geo.longitude), parseFloat(geo.latitude)], type: "Point", radius: 10, text: geo.city || "" } }]));
      }
    }
  },
});
