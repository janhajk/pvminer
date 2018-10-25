var config = require(__dirname + '/config.js');




var start = function() {
   var miner = require(__dirname + '/miner.js');
   var meter = require(__dirname + '/meter.js');

   meter.getGrid(function(sparePower) {
      miner.getActive(function(c) {
         var target = Math.floor((sparePower+c*config.miner.ppc) / config.miner.ppc);
         if (target < 0) target = 0;
         if (target > config.miner.count) target = config.miner.count;
         var hour = new Date().getHours();
         var day = new Date().getDay();
         if (day == 0 || day == 6 || hour >= config.tarifs.nightFrom || hour < config.tarifs.nightTo) {
            console.log('Nighttime/Weekend! Activate all GPUs');
            target = config.miner.count;
         }
         console.log('Cards to Activate: ' + target);
         miner.setGpuCount(target, function(){});
      });
   });
};

start();