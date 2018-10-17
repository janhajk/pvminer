var config = require(__dirname + '/config.js');
var socket = require('net');
var request = require('request');

const broken_gpu = [0];

var fronius_api = {
   GetSensorRealtimeData:   '/solar_api/v1/GetSensorRealtimeData.cgi?Scope=System&DataCollection=NowSensorData',
   GetInverterRealtimeData: '/solar_api/v1/GetInverterRealtimeData.cgi?Scope=System',
   GetActiveDeviceInfo: '/solar_api/v1/GetActiveDeviceInfo.cgi?DeviceClass=System',
   GetMeterRealtimeData: '/solar_api/v1/GetMeterRealtimeData.cgi?Scope=System'
};



var miner_api = function(call, cb) {
   var s = socket.Socket();
   s.on('data', function(d) {
      cb(d);
   });
   s.connect(config.miner.port, config.miner.host);
   s.write(call);
   s.end();
};


var miner_gpu_set = function(count) {
   var id = 0;
   var c = 0;
   for(var i = 0; i < config.miner.count; i++) {
      if(broken_gpu.indexOf(i) === -1 && c < count) {
         c++;
         miner_api('{"id":0,"jsonrpc":"2.0","method":"control_gpu", "params": [' + id + ', ' + 1 + ']}', function(r) {
            console.log('GPU ' + id + ' turned On');
         });
      }
      else {
         miner_api('{"id":0,"jsonrpc":"2.0","method":"control_gpu", "params": [' + id + ', ' + 0 + ']}', function(r) {
            console.log('GPU ' + id + ' turned Off');
         });
      }
   }
};



var meter_api = function(call, cb) {
   var url = 'http://' + config.meter.host + '/' + call;
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
   meter_api(call, function(err, response, body) {
      console.log('> IP ' + config.meter.host + '...');
      var data = JSON.parse(body);
      var pac = data.Body.Data.PAC.Values['1'];
      cb(pac);
   });
};

var get_Grid = function(cb) {
   var call = fronius_api.GetMeterRealtimeData;
   meter_api(call, function(err, response, body) {
   var data = JSON.parse(body);
   var p = data.Body.Data['0'].PowerReal_P_Sum;
   cb(p);
   });
};

var test = function() {
   miner_api('{"id":0,"jsonrpc":"2.0","method":"miner_getstat1"}', function(r) {
      console.log(r.toString());
   });
   meter_api(fronius_api.GetMeterRealtimeData, function(err, response, body) {
      console.log('IP ' + config.meter.host);
      console.log(body);
   });
   get_PAC(function(pac) {
      console.log('PAC: ' + pac + ' Watt');
   });
   get_Grid(function(P) {
      console.log('To/From Grid: ' + P + ' Watt');
   });
};

if (config.dev) test();


var start = function() {
   get_Grid(function(P) {
      if(P > 0) {
         var count = Math.floor(P / 130);
         console.log('Power: ' + P + 'W');
         console.log('Cards to Activate: ' + count);
         miner_gpu_set(count);
         setTimeout(function() {
            miner_api('{"id":0,"jsonrpc":"2.0","method":"miner_getstat1"}', function(r) {
               console.log(r.toString());
            });
         }, 3000);
      }
      else {
         console.log('No Power to activate');
      }
   });
};

start();