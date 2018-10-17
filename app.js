var config = require(__dirname + '/config.js');
var socket = require('net');
var request = require('request');

var fronius_api = {
   GetSensorRealtimeData:   '/solar_api/v1/GetSensorRealtimeData.cgi?Scope=System&DataCollection=NowSensorData',
   GetInverterRealtimeData: '/solar_api/v1/GetInverterRealtimeData.cgi?Scope=System',
   GetActiveDeviceInfo: '/solar_api/v1/GetActiveDeviceInfo.cgi?DeviceClass=System',
   GetMeterRealtimeData: 'GetMeterRealtimeData.cgi?Scope=System'
};



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

var get_PAC = function(cb) {
   var call = fronius_api.GetInverterRealtimeData;
   api_call_meter(config.meter.port, config.meter.host, call, function(err, response, body) {
      console.log('> IP ' + config.meter.host + '...');
      var data = JSON.parse(body);
      var pac = data.Body.Data.PAC.Values['1'];
      cb(pac);
   });
};


api_call_miner(config.miner.port, config.miner.host, '{"id":2,"jsonrpc":"2.0","method":"miner_getstat1"}', function(r){
   console.log(r.toString());
});

api_call_meter(config.meter.port, config.meter.host, fronius_api.GetMeterRealtimeData, function(err, response, body){
   console.log('IP ' + config.meter.host);
   console.log(body);
});

get_PAC(function(pac){
   console.log('PAC: ' + pac + ' Watt');
});