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

router.get('/test', function(req, res) {
  res.render('test', { title: 'AAH - Test' });
});

router.get('/home', checkSignIn, function(req, res) {
  var login = false;
  if(req.query.login) login = true;

  var sql = "SELECT * FROM devices where userid = "+req.session.user.id+";";
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.render('home', { title: 'AAH - Home', user: req.session.user, login: login, devices: result });
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
