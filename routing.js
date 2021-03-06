// User Config File
var config = require(__dirname + '/config.js');

var utils = require(__dirname + '/utils.js');
var auth = require(__dirname + '/auth.js');
var log = require(__dirname + '/log.js');


// System
var path = require('path');
var fs = require('fs');


var basic = function(app, connection) {
    app.get('/', function(req, res) {
        fs.readFile(__dirname + '/public/index.html', 'utf-8', function(err, data) {
            res.send(data);
        });
    });

    app.get('/data/json/minute', /*auth.ensureAuthenticated, */ function(req, res) {
        log.getMinute(connection,function(e, data) {
            res.send(e ? e : data);
        });
    });
    
    app.get('/data/json/minute', /*auth.ensureAuthenticated, */ function(req, res) {
        log.getMinute(connection,function(e, data) {
            res.send(e ? e : data);
        });
    });
};
exports.basic = basic;