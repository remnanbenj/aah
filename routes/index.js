// ====Summary====
//
// /
// - login
//
// /home
// - Display owned devices with small data widget 
//
// /checklogin
// - Check database for email and password match 
// - Start session
//
// /logout
// - Destroy session if there is a user

// Express fields
var express = require('express');
var router = express.Router();

// MySQL Database fields
var mysql = require('mysql');
var con = mysql.createConnection({ host: "localhost", user: "root", password: "spaties23", database: "aah" });


// ====GETS====

router.get('/', function(req, res) {
  if(req.session.user) res.redirect('/home');
  else res.render('index', { title: 'AAH - Login' });
});

router.get('/home', checkSignIn, function(req, res) {
  var sql = "SELECT * FROM devices where userid = "+req.session.user.id+";";
  con.query(sql, function (err, results) {
    if (err) throw err;
    res.render('home', { title: 'AAH - Dashboard', user: req.session.user, devices: results });
  });
});


// ====POSTS====

router.post('/checklogin', function(req, res) {
  // Check database for email and password match
  var sql = "SELECT * FROM users WHERE email = '" + req.query.email + "' AND password = '" + req.query.password + "';";
  con.query(sql, function (err, result) {
    if (err) throw err;

    if(result.length == 1) {
      // Start session
      req.session.user = result[0];
      res.send("Success");
    } else {
      res.send("FAILED: Email and Password do not match any user in our system");
    }

  });
});
	
router.get('/logout', function(req, res) {
  // Log out if there is a user
  if(req.session.user){
    log(req.session.user.name + " logged out");
    req.session.destroy(function(){;});
  }
  res.redirect('/');
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
router.use('/home', function(err, req, res, next) {
  res.redirect('/');
});

module.exports = router;
