var config = require(__dirname + '/config.js');
var socket = require('net');
var request = require('request');

var fronius_api = {
   GetSensorRealtimeData:   '/solar_api/v1/GetSensorRealtimeData.cgi?Scope=System&DataCollection=NowSensorData',
   GetInverterRealtimeData: '/solar_api/v1/GetInverterRealtimeData.cgi?Scope=System',
   GetActiveDeviceInfo: '/solar_api/v1/GetActiveDeviceInfo.cgi?DeviceClass=System',
   GetMeterRealtimeData: '/solar_api/v1/GetMeterRealtimeData.cgi?Scope=System'
};

var Miner = function() {
   var call = function(cmd, p1, p2) {
      var c = '{"id":0,"jsonrpc":"2.0","method":"';
      if(cmd === 'control') {
         return(c + 'control_gpu", "params":["' + p1 + '", "' + p2 + '"]}');
      }
      return(c + 'miner_getstat1"}');
   };
   var write = function(call, cb, id) {
      if(typeof id === 'undefined') id = 0;
      var s = socket.Socket();
      s.on('close', function() {
         cb(id);
      });
      s.connect(config.miner.port, config.miner.host);
      s.write(call);
      s.end();
   };
   var read = function(call, cb) {
      var s = socket.Socket();
      s.on('data', function(d) {
         cb(d);
      });
      s.connect(config.miner.port, config.miner.host);
      s.write(call);
      s.end();
   };
   var setGpu = function(id, state, cb) {
      var c = call('control', id, state);
      write(c, function(id) {
         cb(id);
      }, id);
   };
   this.getActive = function(cb) {
      read(call(), function(d) {
         var data = JSON.parse(d);
         var cards = data.result[3];
         var count = cards.split(";");
         var occurences = 0;
         for(var i = 0; i < count.length; i++) {
            if(count[i] != 'off') occurences++;
         }
         console.log('Cards currently "on": ' + occurences);
         cb(occurences);
      });
   };
   // Set 'count' amount of GPUs 'on', turns the rest 'off'
   this.setGpuCount = function(count, cb) {
      var onGpus = 0; // counter for GPUs turned 'on'
      var f = 0; // async counter
      console.log('turning on ' + count + ' gpus...');
      // Iterate through all available GPUs
      for(var i = 0; i < config.miner.count; i++) {
         if(config.miner.broken.indexOf(i) === -1 && onGpus < count) {
            onGpus++;
            setGpu(i, '1', function(id) {
               f++;
               if(f >= config.miner.count) {
                  cb();
               }
            });
         } else {
            setGpu(i, '0', function(id) {
               f++;
               if(f >= config.miner.count) {
                  cb();
               }
            });
         }
      }
   };
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
      p = -p;
      console.log('Spare Power: ' + p + ' Watt');
      cb(p);
   });
};


var start = function() {
   var miner = new Miner();
   var night = false;
   get_Grid(function(sparePower) {
      miner.getActive(function(c) {
         console.log((c*config.miner.ppm));
         var target = Math.floor((sparePower+c*config.miner.ppm) / config.miner.ppm);
         if (target < 0) target = 0;
         var hour = new Date().getHours();
         if (hour >= 21 || hour <= 6) {
            console.log('Nighttime! Activate all GPUs');
            target = config.miner.count;
         }
         console.log('Cards to Activate: ' + target);
         miner.setGpuCount(target, function(){});
      });
   });
};

start();