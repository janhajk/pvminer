var config = require(__dirname + '/config.js');
var socket = require('net');

const gpuStates = {
   on: '1',
   off: '0'
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
         var active = 0;
         for(var i = 0; i < count.length; i++) {
            if(count[i] != 'off') active++;
         }
         console.log('Cards currently "on": ' + active);
         cb(active);
      });
   };
   // Set 'count' amount of GPUs 'on', turns the rest 'off'
   this.setGpuCount = function(count, cb) {
      var onGpus = 0; // counter for GPUs turned 'on'
      var f = 0;      // async counter
      console.log('turning on ' + count + ' gpus...');
      // Iterate through all available GPUs
      for(var i = 0; i < config.miner.count; i++) {
         if(config.miner.broken.indexOf(i) === -1 && onGpus < count) {
            onGpus++;
            setGpu(i, gpuStates.on, function(id) {
               if(f++ >= config.miner.count) {
                  cb();
               }
            });
         } else {
            setGpu(i, gpuStates.off, function(id) {
               if(f++ >= config.miner.count) {
                  cb();
               }
            });
         }
      }
   };
};

module.exports = new Miner();