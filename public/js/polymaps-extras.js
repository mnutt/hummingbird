(function(po) {
po.fullscreen = function() {
  var fullscreen = {};
  var svg = $(po.svg("svg"))
  var arrow = $(po.svg("path"));
  var map;
  var container;
  var isFullscreen = 0;

  arrow.append("<title>Toggle Fullscreen. (ESC)</title>");

  arrow.attr("d", "M0,0L0,.5 2,.5 2,1.5 4,0 2,-1.5 2,-.5 0,-.5Z")
    .attr("pointer-events", "none")
    .attr("fill", "#FFF");

  arrow.get(0).setAttribute("transform", "translate(16,16)rotate(-45)scale(5)translate(-1.85,0)")

  var shadow = arrow.clone();
  shadow.css({fill: "#000"});

  shadow.get(0).setAttribute("transform", "translate(18,18)rotate(-45)scale(5)translate(-1.85,0)")

  svg.append(shadow);
  svg.append(arrow);
  svg.click(toggleFullscreen);

  $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange fakefullscreenchange', fullscreenChange);

  svg.css({ position: "absolute",
            right: "10px",
            top: "10px",
            visibility: "visible",
            cursor: "pointer" });

  svg.get(0).setAttribute("width", "32");
  svg.get(0).setAttribute("height", "32");

  fullscreen.map = function(x) {
    if (!arguments.length) return map;

    if (map = x) {
      container = $(map.container());
      draw();
    }

    return map;
  };

  function fullscreenChange() {
    isFullscreen = !isFullscreen;

    if(isFullscreen) {
      zoomToWindow();
    } else {
      unZoomToWindow();
    }

    map.resize();
  };

  function toggleFullscreen() {
    if(isFullscreen) {
      cancelFullscreen();
    } else {
      requestFullscreen();
    }
  };

  function requestFullscreen(elem) {
    var elem = container.parent().get(0);

    if (elem.requestFullScreen) {
      elem.requestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else {
      requestFakeFullscreen();
    }
  };

  function cancelFullscreen() {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else {
      cancelFakeFullscreen();
    }
  };

  function requestFakeFullscreen() {
    $("document").trigger('fakefullscreenchange');
  };

  function cancelFakeFullscreen() {
    $("document").trigger('fakefullscreenchange');
  };

  function unZoomToWindow() {
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
    });

    container.parent().find("img.map_logo").hide();
    container.parent().find("div.legend").css({position: 'absolute'});

    arrow.get(0).setAttribute("transform","translate(16,16) rotate(-45) scale(5) translate(-1.85,0)");
    shadow.get(0).setAttribute("transform","translate(18,18) rotate(-45) scale(5) translate(-1.85,0)");
  };

  function zoomToWindow() {
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
    });

    container.parent().find("img.map_logo").show();
    container.parent().find("div.legend").css({position: 'fixed'});

    arrow.get(0).setAttribute("transform","translate(16,16) rotate(135) scale(5) translate(-1.85,0)");
    shadow.get(0).setAttribute("transform","translate(18,18) rotate(135) scale(5) translate(-1.85,0)");
  };

  function draw() {
    container.parent().append(svg);

    return fullscreen;
  };

  return fullscreen;
};
})(org.polymaps);
