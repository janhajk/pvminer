var config = require(__dirname + '/config.js');
var socket = require('net');
var request = require('request');



var api_call_miner = function(port, host, call, cb) {
   var s = socket.Socket();
   s.on('data', function(d) {
      cb(d);
   });
   s.connect(config.miner.port, config.miner.host);
   s.write(call);
   s.end();
};



var api_call_meter = function(port, host, call, cb) {
   var url = 'http://' + host + '/' + call;
   request(url, function(e, response, body) {
      if(e) {
         console.log('error in request ' + url);
         console.log(e);
         cb(e);
      } else {
         cb(null, response, body);
      }
   });
};


api_call_miner(config.miner.port, config.miner.host, '{"id":2,"jsonrpc":"2.0","method":"miner_getstat1"}', function(r){
   console.log(r.toString());
});

api_call_meter(config.meter.port, config.meter.host, '/solar_api/v1/GetInverterRealtimeData.cgi?Scope=System', function(err, response, body){
   console.log('IP ' + config.meter.host);
   console.log(body);
});
