var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var redis   = require("redis");
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var client = redis.createClient();

var index = require('./routes/index');
var controls = require('./routes/controls');
var devices = require('./routes/devices');
var device = require('./routes/device');
var shop = require('./routes/shop');
var data = require('./routes/data');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var timeOut = 8; // hours

app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: "flatpoint23", store: new redisStore({ host: 'localhost', port: 6379, client: client, ttl: timeOut*60*60 }), resave: false, saveUninitialized: false}));
app.use(logger);

app.use('/', index);
app.use('/controls', controls);
app.use('/devices', devices);
app.use('/device', device);
app.use('/shop', shop);
app.use('/data', data);

/* Timestamped log */
global.log = function (message) {
  var date = new Date();

  var day = date.getDate() + "";
  var month = (date.getMonth() + 1) + "";
  if (day.length == 1) day = "0" + day;
  if (month.length == 1) month = "0" + month;

  var seconds = date.getSeconds() + "";
  var minutes = date.getMinutes() + "";
  var hours = date.getHours() + "";
  if (seconds.length == 1) seconds = "0" + seconds;
  if (minutes.length == 1) minutes = "0" + minutes;

  console.log("G: " + hours + ":" + minutes + ":" + seconds + " " + day + "/" + month + " > " + message)
}

/* Logger */
function logger (req, res, next) {
  var date = new Date();
  if(req.session.user) {
    log(req.session.user.name + ", Request: " + req.method + " '" + req.url + "'");

    /*var sql = "update users set sessioncurrent = '" + date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "' where id = " + req.session.user.id;
    con.query(sql, function (err, result) {
      if (err) throw err;
      next();
    });*/

    next();

  } else {
    if(req.url.split('/')[1] != 'data')
      log("Unknown" + ", Request: " + req.method + " '" + req.url + "'");
    next();
  }

}

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

log("Server Started");

module.exports = app;
