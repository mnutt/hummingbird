HummingbirdTracker = {};

HummingbirdTracker.track = function(env) {
  delete env.trackingServer;
  delete env.trackingServerSecure;
  env.u = document.location.href;
  env.bw = window.innerWidth;
  env.bh = window.innerHeight;
  env.guid = document.cookie.match(/guid=([^\_]*)_([^;]*)/)[2];
  env.gen = document.cookie.match(/gender=([^;]*);/)[1];
  env.uid = document.cookie.match(/user_id=([^\_]*)_([^;]*)/)[2];

  $('body').append('<img src="http://localhost:8000/tracking.gif?' + jQuery.param(env) + '"/>');
};
