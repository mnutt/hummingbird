var dgram = require('dgram');

function sendMessage(data) {
  var message = new Buffer(JSON.stringify(data));
  var client = dgram.createSocket("udp4");
  client.send(message, 0, message.length, 8000, "localhost");
  client.close();
}

var msg = {
  "ip" : "129.59.1.10",
  "timestamp" : "Sat Oct 23 2010 21:39:35 GMT-0400 (EDT)",
  "url_key" : 123,
  "product_id" : 456
};

sendMessage(msg);

