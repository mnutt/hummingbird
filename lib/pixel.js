var Buffer = require('buffer').Buffer;

exports.data = new Buffer(42);
exports.data.write("GIF89a\u0001\u0000\u0001\u0000\u0000\u0000\u0000\u0000\u0000ÿÿÿ!ù\u0004\u0001\u0000\u0000\u0000\u0000,\u0000\u0000\u0000\u0000\u0001\u0000\u0001\u0000\u0000\u0002\u0001D\u0000;", 'binary');
exports.size = 42;

exports.headers = {
  'Content-Length': 42,
  'Content-Type':   "image/gif",
  'Pragma':         'no-cache',
  'Cache-Control':  "no-store, no-cache, must-revalidate, max-age=0,post-check=0,pre-check=0"
}
