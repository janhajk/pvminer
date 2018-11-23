var config = require(__dirname + '/config.js');




var start = function() {
   var miner = require(__dirname + '/miner.js');
   var meter = require(__dirname + '/meter.js');

   meter.getSparePower(function(sparePower) {
      miner.getActive(function(c) {
         console.log('Total Sparepower including running GPUs: ' + (sparePower+c*config.miner.ppc));
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


var log_minute = function() {
   var log = require(__dirname + '/log.js');
   log.log(function(){
      
   });
};

start();
log_minute();
