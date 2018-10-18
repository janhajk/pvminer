var config = require(__dirname + '/config.js');
var request = require('request');


var fronius_api = {
   GetSensorRealtimeData: '/solar_api/v1/GetSensorRealtimeData.cgi?Scope=System&DataCollection=NowSensorData',
   GetInverterRealtimeData: '/solar_api/v1/GetInverterRealtimeData.cgi?Scope=System',
   GetActiveDeviceInfo: '/solar_api/v1/GetActiveDeviceInfo.cgi?DeviceClass=System',
   GetMeterRealtimeData: '/solar_api/v1/GetMeterRealtimeData.cgi?Scope=System'
};



var Meter = function() {

   var call = function(path, cb) {
      var url = 'http://' + config.meter.host + '/' + path;
      request(url, function(e, response, body) {
         if(e) {
            console.log('error in request ' + url);
            console.log(e);
            cb(e);
         } else {
            cb(null, response, body);
         }
      });
   };

   var getPAC = function(cb) {
      call(fronius_api.GetInverterRealtimeData, function(err, response, body) {
         console.log('> IP ' + config.meter.host + '...');
         var data = JSON.parse(body);
         cb(data.Body.Data.PAC.Values['1']);
      });
   };

   this.getGrid = function(cb) {
      call(fronius_api.GetMeterRealtimeData, function(err, response, body) {
         var data = JSON.parse(body);
         var p = data.Body.Data['0'].PowerReal_P_Sum;
         p = -p;
         console.log('Current Spare Power: ' + p + ' Watt');
         cb(p);
      });
   };

};

exports = new Meter();