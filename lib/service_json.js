var url = require('url');
var http = require('http');
var sys = require('sys');

exports.fetchJSON = function(remoteURL, callback) {
  remoteURL = url.parse(remoteURL);

  var pagegen = http.createClient(remoteURL.port || 80, remoteURL.hostname);
  // TODO: remoteURL.search
  var request = pagegen.request('GET', remoteURL.pathname, {"host": remoteURL.hostname});
  request.addListener('response', function(response) {
    response.setEncoding('binary');
    response.client.responseBodyParts = '';

    response.addListener('data', function(chunk) {
      response.client.responseBodyParts += chunk;
    });

    response.addListener('end', function() {
      callback(response.client.responseBodyParts);
    });
  });
  request.end();
};
