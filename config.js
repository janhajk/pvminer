
// Claymore Miner
exports.miner = {
   port: 3333,
   host: 'localhost',
   count: 7,
   ppc: 130,
   broken: [0]            // id's of GPUs, that have to be off all the time
};

// Fronius Meter
exports.meter = {
   port: '',
   host: '192.168.1.92'
};

exports.dev = false;