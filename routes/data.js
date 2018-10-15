// Express fields
var express = require('express');
var router = express.Router();

// MySQL Database fields
var mysql = require('mysql');
var con = mysql.createConnection({ host: "localhost", user: "root", password: "spaties23", database: "aah" });


// =====GETS=====

router.get('/reading', function(req, res) {
  var mac = req.query.mac;
  var data = req.query.data.replace(/:DOT:/g, ".");
  var type = req.query.type; 

  var receivedtime = new Date();

  // GMT Time
  receivedtime.setMinutes(receivedtime.getMinutes() + receivedtime.getTimezoneOffset());
  receivedtime = receivedtime.getFullYear() + "-" + (receivedtime.getMonth()+1) + "-" + receivedtime.getDate() + " " + receivedtime.getHours() + ":" + receivedtime.getMinutes() + ":" + receivedtime.getSeconds();

  // Insert into data table async
  var sql = "insert into data (devicemac, data, receivedtime) values ('"+mac+"', '"+data+"', '"+receivedtime+"');";
  con.query(sql, function (err) {
    if (err) throw err;
  });

  // Check if mac exists in table
  var sql = "select id, state from devices where mac = '"+mac+"';";
  con.query(sql, function (err, devices) {
    if (err) throw err;

    if(devices.length == 0) {

      // If no mac exists: Add device to devices tables
      var sql = "insert into devices (userid, type, mac, lastreading, lastreadingdata, state) values (-1, '"+type+"', '"+mac+"', '"+receivedtime+"', '"+data+"', "+0+");";
      con.query(sql, function (err) {
        if (err) throw err;
      });

      // Send data to module
      if(type="TEMP") {
        res.send("re:off");
      } else { res.send("re:success"); }

    } else {

      // Else: Update lastreading of device async
      var sql = "update devices set lastreading = '"+receivedtime+"', lastreadingdata = '"+data+"' where mac = '"+mac+"';";
      con.query(sql, function (err) {
        if (err) throw err;
      });

      // Send data to module
      if(type=="TEMP") {
        console.log(devices[0]);
        console.log(data);

        if(devices[0].state == 1) { res.send("re:on"); }
        else if(devices[0].state == 0) { res.send("re:off"); }
        else { res.send("re:success"); }

      } else { res.send("re:success"); }

    }

  });
});


// =====POSTS=====



/* =====FUCNTIONS===== */



module.exports = router;
