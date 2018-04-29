// Express fields
var express = require('express');
var router = express.Router();

// MySQL Database fields
var mysql = require('mysql');
var con = mysql.createConnection({ host: "localhost", user: "root", password: "spaties23", database: "aah" });


// =====GETS=====

router.get('/', checkSignIn, function(req, res) {
  var sql = "SELECT * FROM devices where userid = "+req.session.user.id+";";
  con.query(sql, function (err, userDevices) {
    if (err) throw err;

    res.render('settings', { title: 'AAH - Settings', user: req.session.user, devices: userDevices });

  });
});


// =====POSTS=====
	
router.post('/adddevice', function(req, res) {
  var deviceName = req.query.name;
  var deviceMac = req.query.mac;

  // Check device connected and unowned
  var sql = "SELECT * FROM devices where userid = -1 and mac = '"+deviceMac+"';";
  con.query(sql, function (err, result) {
    if (err) throw err;

    if(result.length > 0) {

      var sql = "UPDATE devices SET name = '"+deviceName+"', userid = "+req.session.user.id+" WHERE mac = '"+deviceMac+"';";
      con.query(sql, function (err) {
        if (err) throw err;

        var isConnected = false;
        var timeoutMinutes = 60;
        var currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes() - timeoutMinutes);
        if(result[0].lastreading >= currentDate) isConnected = true;
        
        res.send('Success:' + result[0].id + ':' + isConnected);

      });

    } else {
      var message = 'Could not find that MAC Address.<br>Is the device powered and connected?';
      res.send(message);
    }

  });
});
	
router.post('/editdevice', function(req, res) {
  var deviceID = req.query.id;
  var deviceName = req.query.name;

  var sql = "UPDATE devices SET name = '"+deviceName+"' WHERE id = "+deviceID+";";
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send('Success');
  });
});
	
router.post('/removedevice', function(req, res) {
  var deviceID = req.query.id;
  var deviceMAC = req.query.mac;

  var sql = "UPDATE devices SET userid = -1 WHERE id = "+deviceID+";";
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send('Success');
  });
});
	
router.post('/removedevicedata', function(req, res) {
  var deviceMAC = req.query.mac;

  var sql = "DELETE FROM data WHERE devicemac = '"+deviceMAC+"';";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send('Success');
  });
});


  /*var sql = "DELETE FROM data WHERE devicemac = '"+deviceMAC+"';";
  con.query(sql, function (err, result) {
    if (err) throw err;
  });*/


/* =====FUCNTIONS===== */

/* Checks to see if person has signed in */
function checkSignIn(req, res, next){
  if(req.session.user){
    next(); // If session exists go to page
  } else {
    var err = "Not logged in";
    log(err);
    next(err);
  }
}

/* Reroute menu to login page */
router.use('/', function(err, req, res, next) {
  res.redirect('/');
});


module.exports = router;
