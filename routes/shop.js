// Express fields
var express = require('express');
var router = express.Router();

// MySQL Database fields
var mysql = require('mysql');
var con = mysql.createConnection({ host: "localhost", user: "root", password: "spaties23", database: "aah" });


// =====GETS=====

router.get('/', function(req, res) {

  var catagory = req.query.catagory;

  if(catagory && catagory.startsWith("Sensors"))
    renderSensors(req, res, catagory.replace("Sensors", ""));

  else if(catagory && catagory.startsWith("Control"))
    renderControl(req, res, catagory.replace("Control", ""));

  else if(catagory && catagory.startsWith("OffGrid"))
    renderOffGrid(req, res, catagory.replace("OffGrid", ""));

  else 
    res.render('shop/featured', { title: 'AAH - Shop' });

});

function renderOffGrid(req, res, catagory) {
  var sql = "SELECT * FROM shop where catagory = 'OffGrid'";

  if(catagory == "Power") {
    res.render('shop/power', { title: 'AAH - Shop' });

  } else if(catagory == "Food") {
    res.render('shop/food', { title: 'AAH - Shop' });

  } else if(catagory) {
    sql += " and subcatagory = '"+catagory+"'";
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shop/sensors', { title: 'AAH - Shop', items: items });
    });

  } else {
    res.render('shop/offgrid', { title: 'AAH - Shop' });
  }
}

function renderControl(req, res, catagory) {
  var sql = "SELECT * FROM shop where catagory = 'Control'";
  if(catagory) {
    sql += " and subcatagory = '"+catagory+"'";
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shop/sensors', { title: 'AAH - Shop', items: items });
    });
  } else {
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shop/sensors', { title: 'AAH - Shop', items: items });
    });
  }
}

function renderSensors(req, res, catagory) {
  var sql = "SELECT * FROM shop where catagory = 'Sensors'";
  if(catagory) {
    sql += " and subcatagory = '"+catagory+"'";
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shop/sensors', { title: 'AAH - Shop', items: items });
    });
  } else {
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shop/sensors', { title: 'AAH - Shop', items: items });
    });
  }
}


// =====POSTS=====


/* =====FUCNTIONS===== */


module.exports = router;
