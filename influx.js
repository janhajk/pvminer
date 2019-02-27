const config = require(__dirname + '/config.js');
var meter = require(__dirname + '/meter.js');

const Influx = require("influx");
const request = require("request");


const influx = new Influx.InfluxDB({
      host: config.influxdb.host + ':' + config.influxdb.port,
      database: config.influxdb.db,
      username: config.influxdb.user,
      password: config.influxdb.password,

      schema: [{
            measurement: "PAC",
            fields: { value: Influx.FieldType.FLOAT },
            tags: []
      }]
});

let writeData = function() {
      meter.getPAC(function(pv) {
            influx
                  .writePoints(
                        [{
                              measurement: "PAC",
                              fields: { value: pv }
                        }], {
                              database: config.influxdb.db,
                              precision: "s"
                        }
                  )
                  .catch(err => {
                        console.error("Error writing data to Influx.");
                  });
      });
};

setInterval(writeData, 10000);
