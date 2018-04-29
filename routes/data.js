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

  // Aussie Time rearrange
  receivedtime.setHours(receivedtime.getHours() + 4);

  receivedtime = receivedtime.getFullYear() + "-" + (receivedtime.getMonth()+1) + "-" + receivedtime.getDate() + " " + receivedtime.getHours() + ":" + receivedtime.getMinutes() + ":" + receivedtime.getSeconds();
  

  // Insert into data table async
  var sql = "insert into data (devicemac, data, receivedtime) values ('"+mac+"', '"+data+"', '"+receivedtime+"');";
  con.query(sql, function (err) {
    if (err) throw err;
  });

  // Check if mac exists in table
  var sql = "select id from devices where mac = '"+mac+"';";
  con.query(sql, function (err, devices) {
    if (err) throw err;

    if(devices.length == 0) {

      // If no mac exists: Add device to devices tables
      var sql = "insert into devices (userid, type, mac, lastreading, lastreadingdata) values (-1, '"+type+"', '"+mac+"', '"+receivedtime+"', '"+data+"');";
      con.query(sql, function (err) {
        if (err) throw err;
      });

    } else {

      // Else: Update lastreading of device async
      var sql = "update devices set lastreading = '"+receivedtime+"', lastreadingdata = '"+data+"' where mac = '"+mac+"';";
      con.query(sql, function (err) {
        if (err) throw err;
      });

    }

  });

  res.send("re:success");
});


// =====POSTS=====



/* =====FUCNTIONS===== */



module.exports = router;
