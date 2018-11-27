var config = require(__dirname + '/config.js');
var meter = require(__dirname + '/meter.js');



var logWrite = function(cb) {
    meter.getPAC(function(pv) {
        meter.getGrid(function(grid) {
            grid = Math.round(grid);
            pv = Math.round(pv);
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
            var temp = 10;  // TODO: read outside temperature from sensor
            var values = [];
            values.push(Math.floor(Date.now() / 1000));
            values.push(pv);
            values.push(grid);
            values.push(temp);
            var queries = [];
            queries.push('INSERT INTO log_minute (timestamp, pv, grid, temp) VALUES (' + values.join(',') + ')');
            // Five Minute interval
            var coeff = 1000 * 60 * 5;
            var date = new Date();
            var rounded = new Date(Math.round(date.getTime() / coeff) * coeff);
            values = [];
            values.push(Math.floor(rounded / 1000));
            values.push(pv);
            values.push(grid);
            values.push(temp);
            queries.push('INSERT INTO log_5_minute (timestamp, pv, grid, temp) VALUES (' + values.join(',') + ')');
            console.log(queries.join(';'));
            // Fire Queries
            connection.query(queries.join(';'), function(error, results, fields) {
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
            objs.push(['Timestamp', 'PV Produktion', 'From Grid', 'Total used']);
            for (var i = 0; i < rows.length; i++) {
                objs.push([ rows[i].timestamp*1000, rows[i].pv/1000, rows[i].grid/1000, (rows[i].grid+rows[i].pv)/1000/*, rows[i].temp*/ ]);
            };
            cb(JSON.stringify(objs));
        });
};

module.exports.get = logGet;