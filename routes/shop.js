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

  else if(catagory && catagory.startsWith("Harvest"))
    renderHarvest(req, res, catagory.replace("Harvest", ""));

  else 
    res.render('shopfeatured', { title: 'AAH - Shop' });

});

function renderHarvest(req, res, catagory) {
  var sql = "SELECT * FROM shop where catagory = 'Harvest'";
  if(catagory == "Solar") {
    res.render('shopsolar', { title: 'AAH - Shop' });
  } else if(catagory) {
    sql += " and subcatagory = '"+catagory+"'";
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shopsensors', { title: 'AAH - Shop', items: items });
    });
  } else {
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shopsensors', { title: 'AAH - Shop', items: items });
    });
  }
}

function renderControl(req, res, catagory) {
  var sql = "SELECT * FROM shop where catagory = 'Control'";
  if(catagory) {
    sql += " and subcatagory = '"+catagory+"'";
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shopsensors', { title: 'AAH - Shop', items: items });
    });
  } else {
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shopsensors', { title: 'AAH - Shop', items: items });
    });
  }
}

function renderSensors(req, res, catagory) {
  var sql = "SELECT * FROM shop where catagory = 'Sensors'";
  if(catagory) {
    sql += " and subcatagory = '"+catagory+"'";
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shopsensors', { title: 'AAH - Shop', items: items });
    });
  } else {
    con.query(sql, function (err, items) {
      if (err) throw err;
      res.render('shopsensors', { title: 'AAH - Shop', items: items });
    });
  }
}


// =====POSTS=====


/* =====FUCNTIONS===== */


module.exports = router;
