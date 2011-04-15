var dgram = require('dgram');
var fs = require('fs');

function sendMessage(data) {
  var message = new Buffer(JSON.stringify(data));
  var client = dgram.createSocket("udp4");
  client.send(message, 0, message.length, 8000, "localhost");
  client.close();
}

var filename = process.argv[1];
if(!filename) {
  console.log("No file specified");
  exit(1);
}
console.log("Watching " + filename);

fs.watchFile(filename, function(curr, prev) {
  console.log("HERE");
  if(prev.size > curr.size) return {clear:true};
  var stream = fs.createReadStream(filename, { start: prev.size, end: curr.size});
  stream.addListener("data", function(lines) {
    console.log("GOT MESSAGE");
    lines.toString('utf-8').split("\n").forEach(function(line) {
      var data = JSON.parse(line);
      data.ip = data.remote_addr;
      data.u = data.request_uri;
      delete data.remote_addr;
      delete data.request_uri;
    });
  });
});
