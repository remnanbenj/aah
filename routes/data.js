// ====Summary====
//
// /data/reading
// - Receive data from a device
// - Insert into data table with GMT time
// - If(device mac address doesn't exist in devices): addDevice()
// - Else: Update last reading and send data to device
//
// addDevice()
// - Add device to devices table with default variables

// Express fields
var express = require('express');
var router = express.Router();

// MySQL Database fields
var mysql = require('mysql');
var con = mysql.createConnection({ host: "localhost", user: "root", password: "spaties23", database: "aah" });


// ====GETS====

router.get('/reading', function(req, res) {
  var mac = req.query.mac;
  var data = req.query.data.replace(/:DOT:/g, ".");
  var type = req.query.type; 
  if(type == "TEMP") type = "WTRHTR";

  // Setup reveivedtime
  var receivedtime = new Date();
  receivedtime.setMinutes(receivedtime.getMinutes() + receivedtime.getTimezoneOffset()); // GMT Time
  receivedtime = getFormatedDate(receivedtime); // Format date yyyy-mm-dd HH:MM:SS

  // Insert into data table async
  var sql = "insert into data (devicemac, data, receivedtime) values ('"+mac+"', '"+data+"', '"+receivedtime+"');";
  con.query(sql, function (err) {
    if (err) throw err;
  });

  // Check if mac exists in table
  var sql = "select * from devices where mac = '"+mac+"';";
  con.query(sql, function (err, devices) {
    if (err) throw err;

    // If(no mac exists): Add device to devices table
    if(devices.length == 0) {
      addDevice(type, mac, receivedtime);

    // Else: Update last reading and send data to device
    } else {
      var sql = "update devices set lastreading = '"+receivedtime+"' where mac = '"+mac+"';";
      con.query(sql, function (err) { if (err) throw err; });

      // ===POWER MONITOR===
      if(type == "AMP") {
        res.send("re:success");

      // ===WATER HEATER===
      } else if(type == "WTRHTR") {
        var variables = devices[0].variables.split(',');
        data = data.split(':');
        if(data[variables[2]] > variables[0]) { // If ( temp [selectedtempsensor] is bigger than [maxtemp] ) : turn off water heater
          var sql = "update devices set state = 0 where mac = '"+mac+"';";
          con.query(sql, function (err) { if (err) throw err; });
          res.send("re:off"); 
        } else if(data[variables[2]] < variables[0] - variables[1]) { // If ( temp [selectedtempsensor] is smaller than [maxtemp] - [temprange] ) :turn on water heater
          var sql = "update devices set state = 1 where mac = '"+mac+"';";
          con.query(sql, function (err) { if (err) throw err; });
          res.send("re:on"); 
        } else { // Else : send success
          res.send("re:success");
        }
      } 

    }

  });
});

// Add device to devices table with default variables and updated lastreading time
function addDevice(type, mac, receivedtime){

  // ===POWER MONITOR====
  if(type == "AMP") { 
    var sql = "insert into devices (userid, type, mac, lastreading, variables) values (-1, '"+type+"', '"+mac+"', '"+receivedtime+"', 'Channel 1:000000:1,Channel 2:FF0000:1,Channel 3:F2A100:1,Channel 4:00C400:1,Channel 5:00AAFF:1,Channel 6:5162FF:1,Channel 7:9B00EF:1,Channel 8:ED00C5:1');";
    con.query(sql, function (err) { if (err) throw err; });
    res.send("re:success");

  // ===WATER HEATER====
  } else if(type == "WTRHTR") { 
    var sql = "insert into devices (userid, type, mac, lastreading, variables) values (-1, '"+type+"', '"+mac+"', '"+receivedtime+"', '55,2,0');";
    con.query(sql, function (err) { if (err) throw err; });
    res.send("re:off");

  // ===FAILED====
  } else { 
    console.log("ERROR: Failed to add device. Could not find device type.");
  }

}


// =====POSTS=====


// =====FUCNTIONS=====

// Displays yyyy-mm-dd HH:MM:SS
function getFormatedDate(date){
  var dateString = "";
  dateString += date.getFullYear() + "-";
  dateString += String((date.getMonth()+1)).length == 1 ? "0" + (date.getMonth()+1) + "-" : (date.getMonth()+1) + "-";
  dateString += String(date.getDate()).length == 1 ? "0" + date.getDate() + " " : date.getDate() + " ";
  dateString += String(date.getHours()).length == 1 ? "0" + date.getHours() + ":" : date.getHours() + ":";
  dateString += String(date.getMinutes()).length == 1 ? "0" + date.getMinutes() + ":" : date.getMinutes() + ":";
  dateString += String(date.getSeconds()).length == 1 ? "0" + date.getSeconds() : date.getSeconds();
  return dateString;
}

module.exports = router;
