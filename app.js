var config = require(__dirname + '/config.js');
var socket = require('net');




var api_call_miner = function(port, host, call, cb) {
   var s = socket.Socket();
   s.on('data', function(d) {
      cb(d);
   });
   s.connect(config.miner.port, config.miner.host);
   s.write(call);
   s.end();
};

api_call_miner(config.miner.port, config.miner.host, '{"id":2,"jsonrpc":"2.0","method":"miner_getstat1"}', function(r){
   console.log(r.toString());
});