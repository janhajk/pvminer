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



var miner_api = function(call, id, cb) {
   var s = socket.Socket();
   s.on('close', function(d) {
      cb(id);
   });
   s.connect(config.miner.port, config.miner.host);
   s.write(call);
   s.end();
};


var miner_gpu_set = function(count, cb) {
   var c = 0;
   var f = 0;
   var call = '';
   console.log('turning on ' + count + ' gpus...');
   for(var i = 0; i < config.miner.count; i++) {
      console.log('Setting Card' + i);
      if(broken_gpu.indexOf(i) === -1 && c < count) {
         c++;
         console.log('Card On');
         call = '{"id":0,"jsonrpc":"2.0","method":"control_gpu", "params":[' + i + ', ' + 1 + ']}';
         miner_api(call, i, function(i) {
            console.log('GPU ' + i + ' turned On');
            f++;
            if (f >= config.miner.count) {
               cb();
            }
         });
      }
      else {
         console.log('Card Off');
         call = '{"id":0,"jsonrpc":"2.0","method":"control_gpu", "params":[' + i + ', ' + 0 + ']}';
         miner_api(call, i, function(i) {
            console.log('GPU ' + i + ' turned Off');
            f++;
            if (f >= config.miner.count) {
               cb();
            }
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
      var count = Math.floor(P / 130);
      console.log('Power: ' + P + 'W');
      if(P < 0) {
         console.log('Cards to Activate: ' + Math.abs(count));
         miner_gpu_set(Math.abs(count), function() {
            miner_api('{"id":0,"jsonrpc":"2.0","method":"miner_getstat1"}', 0, function(r) {
               console.log(r.toString());
            });
         });
      } else {
         console.log('No Power to activate');
         miner_gpu_set(0, function() {
            console.log('turned off all GPUs!');
            miner_api('{"id":0,"jsonrpc":"2.0","method":"miner_getstat1"}', function(r) {
               console.log(r.toString());
            });
         });
      }
   });
};

start();