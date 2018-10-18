var config = require(__dirname + '/config.js');




var start = function() {
   var miner = new require(__dirname + '/miner.js');
   var meter = new require(__dirname + '/meter.js');

   meter.getGrid(function(sparePower) {
      miner.getActive(function(c) {
         var target = Math.floor((sparePower+c*config.miner.ppc) / config.miner.ppc);
         if (target < 0) target = 0;
         if (target > config.miner.count) target = config.miner.count;
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