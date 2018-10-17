var config = require(__dirname + '/config.js');
var socket = require('net');




var api_call = function(port, host, call) {
   var s = socket.Socket();
   s.on('data', function(d) {
      console.log(d.toString());
   });
   s.connect(config.miner.port, config.miner.host);
   s.write(call);
   s.end();
};

api_call(config.miner.port, config.miner.host, '{"id":2,"jsonrpc":"2.0","method":"miner_getstat1"}');