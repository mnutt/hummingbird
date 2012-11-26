
var Buffer = require('buffer').Buffer;
var dgram = require('dgram');

var sock = dgram.createSocket("udp4");

var data = {
	ip: '127.0.0.1',
	// '141.101.99.4',
	event: 'cart_add',
	headers: '/' // this is the full url
};




var buf = new Buffer(JSON.stringify(data));

console.log('buf:' + buf);

setInterval(function() {
	sock.send(buf, 0, buf.length, 8000, "0.0.0.0");
},100);
