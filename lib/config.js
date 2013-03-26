var fs = require('fs');

var configPath = __dirname + "/../config/config.js";
var sampleConfigPath = __dirname + "/../config/config.example.js";

if(fs.existsSync(configPath)) {
  module.exports = require(configPath);
} else {
  console.log("config/config.js doesn't exist; creating it...");
  fs.createReadStream(sampleConfigPath).pipe(fs.createWriteStream(configPath));
  module.exports = require(sampleConfigPath);
}
