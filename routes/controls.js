// Express fields
var express = require('express');
var router = express.Router();

// MySQL Database fields
var mysql = require('mysql');
var con = mysql.createConnection({ host: "localhost", user: "root", password: "spaties23", database: "aah" });


// =====GETS=====

router.get('/', checkSignIn, function(req, res) {
  res.render('controls', { title: 'AAH - Controls', user: req.session.user });
});


// =====POSTS=====



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
