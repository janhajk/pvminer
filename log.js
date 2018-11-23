var mysql = require('mysql');
var config = require(__dirname + '/config.js');
var meter = require(__dirname + '/meter.js');


var connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.db,
    port: config.database.port
});


var Log = function(cb) {
    meter.getPAC(function(pv) {
        meter.getGrid(function(grid) {
            // Open Connection
            connection.connect();
            
            // Write to DB
            var values = [];
            values.push(Math.floor(Date.now() / 1000));
            values.push(pv);
            values.push(grid);
            values.push(10);
            connection.query('INSERT INTO log_minute (timestamp, pv, grid, temp) VALUES (' + values.join(',') + ')', function(error, results, fields) {
                if (error) throw error;
                cb();
            });
            // Close connection
            connection.end();

        });
    });

};



module.exports.log = Log;