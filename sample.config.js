
// Claymore Miner
exports.miner = {
   port: 3333,
   host: 'localhost',
   count: 7,
   ppc: 130,
   broken: [0]            // id's of GPUs, that have to be off all the time
};

exports.port = 1234;

exports.cookiesecret

// Fronius Meter
exports.meter = {
   port: '',
   host: '192.168.1.92'
};

exports.tarifs = {
   nightFrom: 21,
   nightTo: 6
};

exports.database = {
   host: '192.168.1.65',
   user: 'root',
   password: '',
   port: 3306,
   db: 'solarweb'
};

exports.dev = false;