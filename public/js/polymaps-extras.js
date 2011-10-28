(function(po) {
po.types.Marker = function(o, proj) {
  var g = po.svg("g"),
  c = o.coordinates,
  p = proj(o.coordinates),
  r = o.radius || 4.5,
  circle = po.svg("circle");

  circle.setAttribute("r", r);
  circle.setAttribute("style", "fill: " + o.color + ";");
  circle.setAttribute("class", "point");
  circle.setAttribute("transform", "translate(" + p.x + "," + p.y + ")");
  g.appendChild(circle);
  g.setAttribute("class", "point");
  g.setAttribute("id", o.id);
  g.addEventListener("mouseover", function(e) {
    var el = e.target.parentNode;
    el.parentNode.appendChild(el);
  }, true);

  if(o.text) {
    var t = po.svg("text");
    t.textContent = o.text;
    t.setAttribute("class", "label");
    t.setAttribute("transform", "translate(" + p.x + "," + (p.y - r - 17) + ")");
    g.appendChild(t);

    setTimeout(function() {
      var b = po.svg("path");
      var textWidth = (t.getBBox().width / 2) + 6;

      var bg = "";
      bg += "M 0, 29";
      bg += "L -5, 24";
      bg += "L " + (-1 * (textWidth - 5)) + ", 24";
      bg += "A 5, 5, 0, 0, 1, " + (-1 * textWidth) + ", 19";
      bg += "L " + (-1 * textWidth) + ", 17";
      bg += "L " + (-1 * textWidth) + ", 12";
      bg += "L " + (-1 * textWidth) + ", 7";
      bg += "L " + (-1 * textWidth) + ", 5";
      bg += "A 5, 5, 0, 0, 1, " + (-1 * (textWidth - 5)) + ", 0";
      bg += "L 5, 0";
      bg += "L 0, 0";
      bg += "L 5, 0";
      bg += "L " + (textWidth - 5) + ", 0";
      bg += "A 5, 5, 0, 0, 1, " + textWidth + ", 5";
      bg += "L " + textWidth + ", 7";
      bg += "L " + textWidth + ", 12";
      bg += "L " + textWidth + ", 17";
      bg += "L " + textWidth + ", 19";
      bg += "A 5, 5, 0, 0, 1, " + (textWidth - 5) + ", 24";
      bg += "L 5, 24";
      bg += "Z";

      b.setAttribute("d", bg);
      b.setAttribute("class", "label");
      b.setAttribute("transform", "translate(" + (p.x) + "," + (p.y - r - 32) + ")");
      g.appendChild(b);
      g.appendChild(t);

    }, 5);

  }

  return g;
};

po.fullscreen = function() {
  var fullscreen = {};
  var svg = $(po.svg("svg"))
  var circle = $(po.svg("circle"));
  var arrow = $(po.svg("path"));
  var map;
  var container;
  var isFullscreen = 0;

  svg.append(circle);
  svg.append(arrow);
  svg.click(goFullscreen);
  $(window).bind("keydown",function(e){
    e.which == 27 && isFullscreen && goFullscreen();
  });

  svg.css({ position: "absolute",
            right: "4px",
            top: "5px",
            visibility: "visible",
            cursor: "pointer" });

  svg.get(0).setAttribute("width", "32");
  svg.get(0).setAttribute("height", "32");

  circle.attr("fill", "#fff")
    .attr("stroke", "#ccc")
    .attr("stroke-width", "4");

  circle.get(0).setAttribute("cx", "16");
  circle.get(0).setAttribute("cy", "16");
  circle.get(0).setAttribute("r", "14");

  circle.append("<title>Toggle Fullscreen. (ESC)</title>");

  arrow.attr("d", "M0,0L0,.5 2,.5 2,1.5 4,0 2,-1.5 2,-.5 0,-.5Z")
    .attr("pointer-events", "none")
    .attr("fill", "#aaa");

  arrow.get(0).setAttribute("transform", "translate(16,16)rotate(-45)scale(5)translate(-1.85,0)")

  fullscreen.map = function(x) {
    if (!arguments.length) return map;

    if (map = x) {
      container = $(map.container());
      draw();
    }

    return map;
  };

  function goFullscreen() {
    if(isFullscreen = !isFullscreen) {
      container.css({
        position: "fixed",
        borderWidth: 0,
        width: "100%",
        height: "100%",
        top: 0,
        left: 0
      });

      svg.css({
        position: "fixed",
        right: "16px",
        top: "16px"
      });

      arrow.get(0).setAttribute("transform","translate(16,16) rotate(135) scale(5) translate(-1.85,0)");

    } else {
      container.css({
        position: "relative",
        borderWidth: null,
        width: null,
        height: null,
        top: null,
        left: null
      });

      svg.css({
        position: "absolute",
        right: "-16px",
        top: "-16px"
      });

      arrow.get(0).setAttribute("transform","translate(16,16) rotate(-45) scale(5) translate(-1.85,0)");
    }

    map.resize()
  };

  function draw() {
    container.parent().append(svg);

    return fullscreen;
  };

  return fullscreen;
};
})(org.polymaps);