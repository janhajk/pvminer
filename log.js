var config = require(__dirname + '/config.js');
var meter = require(__dirname + '/meter.js');



var logWrite = function(cb) {
    meter.getPAC(function(pv) {
        meter.getGrid(function(grid) {
            var mysql = require('mysql');
            var connection = mysql.createConnection({
                host: config.database.host,
                user: config.database.user,
                password: config.database.password,
                database: config.database.db,
                port: config.database.port
            });
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



module.exports.write = logWrite;

var logGet = function(connection, cb) {

    connection.query('SELECT * FROM log_minute',
        function(error, rows, fields) {
            var objs = [];
            for (var i = 0; i < rows.length; i++) {
                objs.push([ rows[i].timestamp, rows[i].pv, /*rows[i].grid, rows[i].temp*/ ]);
            };
            cb(JSON.stringify(objs));
        });
};

module.exports.get = logGet;