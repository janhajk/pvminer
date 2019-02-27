const config = require(__dirname + '/config.js');
var meter = require(__dirname + '/meter.js');

const Influx = require("influx");


const influx = new Influx.InfluxDB({
      host: config.influxdb.host + ':' + config.influxdb.port,
      database: config.influxdb.db,
      username: config.influxdb.user,
      password: config.influxdb.password,

      schema: [{
            measurement: "powerdata",
            fields: {
                  pac: Influx.FieldType.FLOAT,
                  grid: Influx.FieldType.FLOAT,
                  total: Influx.FieldType.FLOAT,
                  day_energy: Influx.FieldType.FLOAT
            },
            tags: []
      }]
});

let writeData = function() {
      meter.getInverter(function(dataInverter) {
            meter.getGrid(function(grid) {
                  influx
                        .writePoints(
                              [{
                                    measurement: "powerdata",
                                    fields: {
                                          pac: dataInverter.pac,
                                          grid: grid,
                                          total: dataInverter.pac + grid,
                                          day_energy: dataInverter.day_energy
                                    }
                              }], {
                                    database: config.influxdb.db,
                                    precision: "s"
                              }
                        )
                        .catch(err => {
                              console.error("Error writing data to Influx.");
                        });
            });
      });
};
// influx.query('DROP SERIES FROM /.*/').then(results => {
//   console.log(results)
// })
setInterval(writeData, 10000);
