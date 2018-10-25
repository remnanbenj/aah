// ====Summary====
//
// /devices/
// - Gets all devices linked to user
//
// /devices/adddevice
// - Check device connected and unowned
// - TODO: Check if device is connected and owned
// - Link device to current user
// - Check device connected (lastreading within 60 mins)
// - Send success and if it is connected
//
// /devices/editdevice
// - TODO: Check current user owns device
// - Change devices name
//
// /devices/removedevice
// - TODO: Check current user owns device
// - Set userid = -1 unlinking the device from the user
//
// ====Power Monitor====
//
// /devices/renamechannel
// - TODO: Check current user owns device
// - Renames the channel
//
// /devices/recolorchannel
// - TODO: Check current user owns device
// - Changes color of channel
//
// /devices/activechannel
// - TODO: Check current user owns device
// - Sets channel active or disabled
//
// ====Water Heater====
//
// /devices/changewtrtemp
// - TODO: Check current user owns device
// - Changes maxtemp and temprange
// - TODO: also change selected temperature

// Express fields
var express = require('express');
var router = express.Router();

// MySQL Database fields
var mysql = require('mysql');
var con = mysql.createConnection({ host: "localhost", user: "root", password: "spaties23", database: "aah" });


// ====GETS====

router.get('/', checkSignIn, function(req, res) {
  var sql = "SELECT * FROM devices where userid = "+req.session.user.id+";";
  con.query(sql, function (err, userDevices) {
    if (err) throw err;
    res.render('devices', { title: 'AAH - Settings', user: req.session.user, devices: userDevices, page: 'devices' });
  });
});


// ====POSTS====
	
router.post('/adddevice', checkSignIn, function(req, res) {
  var deviceName = req.query.name;
  var deviceMac = req.query.mac;

  // Check device has connected before and is unlinked to another account
  var sql = "SELECT * FROM devices where userid = -1 and mac = '"+deviceMac+"';";
  con.query(sql, function (err, result) {
    if (err) throw err;

    // Link device to current user
    if(result.length > 0) {
      var sql = "UPDATE devices SET name = '"+deviceName+"', userid = "+req.session.user.id+" WHERE mac = '"+deviceMac+"';";
      con.query(sql, function (err) {
        if (err) throw err;

        // Check device connected
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
	
router.post('/editdevice', checkSignIn, function(req, res) {
  var deviceID = req.query.id;
  var deviceName = req.query.name;
  var sql = "UPDATE devices SET name = '"+deviceName+"' WHERE id = "+deviceID+";";
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send('Success');
  });
});
	
router.post('/removedevice', checkSignIn, function(req, res) {
  var deviceID = req.query.id;
  var deviceMAC = req.query.mac;
  var sql = "UPDATE devices SET userid = -1 WHERE id = "+deviceID+";";
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send('Success');
  });
});
	
router.post('/removedevicedata', checkSignIn, function(req, res) {
  var deviceMAC = req.query.mac;
  var sql = "DELETE FROM data WHERE devicemac = '"+deviceMAC+"';";
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send('Success');
  });
});
	

// ====Power Monitor====

router.post('/renamechannel', checkSignIn, function(req, res) {
  var deviceID = req.query.id;
  var newName = req.query.name;
  var channel = Number(req.query.channel);

  var sql = "SELECT labels FROM devices WHERE id = "+deviceID+";";
  con.query(sql, function (err, device) {
    if (err) throw err;

    var channels = device[0].labels.split(',');
    channels[channel-1] = newName + '-' + channels[channel-1].split('-')[1] + '-' + channels[channel-1].split('-')[2];

    var sql = "UPDATE devices SET labels = '"+channels.toString()+"' WHERE id = "+deviceID+";";
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send('Success');
    });

  });
});

router.post('/recolorchannel', checkSignIn, function(req, res) {
  var deviceID = req.query.id;
  var newColor = req.query.color;
  var channel = Number(req.query.channel);

  var sql = "SELECT labels FROM devices WHERE id = "+deviceID+";";
  con.query(sql, function (err, device) {
    if (err) throw err;

    var channels = device[0].labels.split(',');
    channels[channel-1] = channels[channel-1].split('-')[0] + '-' + newColor + '-' + channels[channel-1].split('-')[2];

    var sql = "UPDATE devices SET labels = '"+channels.toString()+"' WHERE id = "+deviceID+";";
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send('Success');
    });

  });
});

router.post('/activechannel', checkSignIn, function(req, res) {
  var deviceID = req.query.id;
  var channel = Number(req.query.channel);

  var sql = "SELECT labels FROM devices WHERE id = "+deviceID+";";
  con.query(sql, function (err, device) {
    if (err) throw err;

    var channels = device[0].labels.split(',');
    channels[channel-1] = channels[channel-1].split('-')[0] + '-' + channels[channel-1].split('-')[1] + '-' + (channels[channel-1].split('-')[2] == 1 ? 0 : 1);

    var sql = "UPDATE devices SET labels = '"+channels.toString()+"' WHERE id = "+deviceID+";";
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send((channels[channel-1].split('-')[2] == 1 ? 'Activated' : 'Disabled'));
    });

  });
});


// ====Water Heater====

router.post('/changewtrtemp', function(req, res) {
  var deviceID = req.query.id;
  var newTemp = req.query.newtemp;
  var newRange = req.query.newrange;
  var newVars = req.query.newtemp + "," + req.query.newrange + ",0";

  var sql = "UPDATE devices SET variables = '"+newVars+"' WHERE id = "+deviceID+";";
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send('Success');
  });
});


// ====FUCNTIONS====

// Checks to see if person has signed in
function checkSignIn(req, res, next){
  if(req.session.user){
    next(); // If session exists go to page
  } else {
    var err = "Not logged in";
    log(err);
    next(err);
  }
}
router.use('/', function(err, req, res, next) {
  res.redirect('/');
});

module.exports = router;
