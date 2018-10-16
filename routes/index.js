// Express fields
var express = require('express');
var router = express.Router();

// MySQL Database fields
var mysql = require('mysql');
var con = mysql.createConnection({ host: "localhost", user: "root", password: "spaties23", database: "aah" });


// =====GETS=====

router.get('/', function(req, res) {
  if(req.session.user) res.redirect('/home');
  else res.render('index', { title: 'AAH - Login' });
});

router.get('/home', checkSignIn, function(req, res) {
  // Get all devices
  var sql = "SELECT * FROM devices where userid = "+req.session.user.id+" order by lastreading desc;";
  con.query(sql, function (err, results) {
    if (err) throw err;
    res.render('home', { title: 'AAH - Dashboard', user: req.session.user, devices: results });
  });
});


// =====POSTS=====

router.post('/checklogin', function(req, res) {

  // Log out of database if a user is already logged in
  /*if(req.session.user) {
    var sql = "update users set online = 0 where id = " + req.session.user.id + ";";
    con.query(sql, function (err, result) {
      if (err) throw err;
    });
  }*/
  
  var sql = "SELECT * FROM users WHERE email = '" + req.query.email + "' AND password = '" + req.query.password + "';";
  con.query(sql, function (err, result) {
    if (err) throw err;

    if(result.length == 1) {

      // Start session
      req.session.user = result[0];

      // Set online and store start of session in database
      /*var date = new Date();
      var sql = "update users set online = 1, sessionstart = '"+date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()+"', sessioncurrent = '"+date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()+"' where id = " + result[0].id + ";";
      con.query(sql, function (err, result) {
        if (err) throw err;
      });*/

      res.send("Success");

    } else {
      res.send("FAILED: result.length != 1");
    }
  });

});
	
router.get('/logout', function(req, res) {
  // Log out if there is a user
  if(req.session.user){
    // Log out of database
    /*var sql = "update users set online = 0 where id = " + req.session.user.id + ";";
    con.query(sql, function (err, result) {
      if (err) throw err;
    });*/

    log(req.session.user.name + " logged out");
    req.session.destroy(function(){;});
  }

  res.redirect('/');
});


/* =====FUCNTIONS===== */

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

function getReadableDate(date){
  var dateString = "";
  var hours = date.getHours();
  var hoursSuffix = "am";
  if(hours == 12) { hoursSuffix = "PM"; }
  else if(hours > 12) { hours -= 12; hoursSuffix = "PM"; }

  dateString += String(hours).length == 1 ? "0" + hours + ":" : hours + ":";
  dateString += String(date.getMinutes()).length == 1 ? "0" + date.getMinutes() + ":" : date.getMinutes() + ":";
  dateString += String(date.getSeconds()).length == 1 ? "0" + date.getSeconds() + hoursSuffix + " - " : date.getSeconds() + hoursSuffix + " - ";
  dateString += String(date.getDate()).length == 1 ? "0" + date.getDate() + "/" : date.getDate() + "/";
  dateString += String((date.getMonth()+1)).length == 1 ? "0" + (date.getMonth()+1) : (date.getMonth()+1);
  return dateString;
}

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
router.use('/home', function(err, req, res, next) {
  res.redirect('/');
});

/* Reroute menu to login page */
router.use('/statistics', function(err, req, res, next) {
  res.redirect('/');
});

/* Reroute menu to login page */
router.use('/controls', function(err, req, res, next) {
  res.redirect('/');
});

/* Reroute menu to login page */
router.use('/settings', function(err, req, res, next) {
  res.redirect('/');
});


module.exports = router;
