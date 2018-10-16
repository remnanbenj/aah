// Express fields
var express = require('express');
var router = express.Router();

// MySQL Database fields
var mysql = require('mysql');
var con = mysql.createConnection({ host: "localhost", user: "root", password: "spaties23", database: "aah" });


// =====GETS=====

router.get('/', checkSignIn, function(req, res) {
  var id = req.query.id;
  var timescale = 'day';
  if(req.query.timescale) timescale = req.query.timescale;

  var sql = "SELECT * FROM devices where id = "+id+" and userid = "+req.session.user.id+";";
  con.query(sql, function (err, results) {
    if (err) throw err;

    if(results.length > 0) {
      var device = results[0];
      device.lastreading = getReadableDate(device.lastreading);

      if(device.type == 'AMP') {
        res.render('device/amp', { title: 'AAH - Power Monitor', user: req.session.user, device: device });

      } else if(device.type == 'WTRLVL') {
        res.render('device/wtrlvl', { title: 'AAH - Water Level', user: req.session.user, device: device });

      } else if(device.type == 'TEMP') {
        res.render('device/temp', { title: 'AAH - Temperature', user: req.session.user, device: device });

      } else if(device.type == 'VOLT') {
        res.render('device/volt', { title: 'AAH - Voltmeter', user: req.session.user, device: device });
      }

    } else {
      console.log("Error: No device found");
    }

  });
});

router.get('/getdata', checkSignIn, function(req, res) {
  // All devices variables
  var deviceMac = req.query.devicemac;
  var type = req.query.type;
  var timeScale = req.query.timescale;
  var timezoneOffset = Number(req.query.timezoneoffset);

  // Power monitor variables
  var channels = [9];
  if(req.query.channels) channels = req.query.channels.split(',');

  // Set start and end date (startdate comes in NZT format)
  var startDate = new Date(req.query.startdate);
  var endDate = new Date(req.query.startdate);

  if(timeScale == 'hour'){
    var time = Number(req.query.time);
    var ampm = req.query.ampm;

    if(time == 12 && ampm == 'AM') time = 0;
    if(ampm == 'AM' || time == 12 && ampm == 'PM') {
      startDate.setHours(time);
      endDate.setHours(time);
    } else {
      startDate.setHours(time + 12);
      endDate.setHours(time + 12);
    }

    startDate.setMinutes(0);
    startDate.setSeconds(-10);
    endDate.setMinutes(60);
    endDate.setSeconds(10);

    startDate.setMinutes(startDate.getMinutes() + timezoneOffset);
    endDate.setMinutes(endDate.getMinutes() + timezoneOffset);

  } else if(timeScale == 'halfday'){
    var time = Number(req.query.time);
    var ampm = req.query.ampm;

    if(time == 12 && ampm == 'AM') time = 0;
    if(ampm == 'AM' || time == 12 && ampm == 'PM') {
      startDate.setHours(time);
      endDate.setHours(time);
    } else {
      startDate.setHours(time + 12);
      endDate.setHours(time + 12);
    }

    startDate.setHours(startDate.getHours() - 12);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    endDate.setMinutes(60);
    endDate.setSeconds(0);

    startDate.setMinutes(startDate.getMinutes() + timezoneOffset);
    endDate.setMinutes(endDate.getMinutes() + timezoneOffset);

  } else if(timeScale == 'day'){
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    endDate.setHours(24);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
  }

  //console.log("Start: " + getFormatedDate(startDate));
  //console.log("End:   " + getFormatedDate(endDate));

  // Get data
  var sql = "SELECT * FROM data where devicemac = '"+deviceMac+"' and receivedtime > '"+getFormatedDate(startDate)+"' and receivedtime < '"+getFormatedDate(endDate)+"';";
  con.query(sql, function (err, results) {
    if (err) throw err;

    // Reduce Data
    if(type == "AMP") {
      results = reduceAmpResults(results, timeScale, startDate, endDate, channels);
    } else if(type == "TEMP") {
      //results = reduceResults(results, timeScale, startDate, endDate);
    } else {
      results = reduceResults(results, timeScale, startDate, endDate);
    }

    // Setup Fields
    var data = [];
    var dataRow = [];

    if(type == "AMP") {
      dataRow.push('Time');
      for(var i = 0; i < channels.length; i++){
        if(timeScale == 'hour') dataRow.push('KiloWatts');
        else if(timeScale == 'halfday') dataRow.push('KiloWatts');
        else if(timeScale == 'day') dataRow.push('KiloWatt Hours');
      }

    } else if(type == "WTRLVL") {
      dataRow.push('Time');
      dataRow.push('Metres');

    } else if(type == "TEMP") {
      dataRow.push('Time');
      dataRow.push('Celsius1');
      dataRow.push('Celsius2');

    } else if(type == "VOLT") {
      dataRow.push('Time');
      dataRow.push('Voltage');
    }
    data.push(dataRow);

    // Setup Data
    if(results.length > 0) {

      if(type == "AMP") {
        for(var i = 0; i < results.length; i++){
          var tempDate = new Date(results[i].receivedtime);
          tempDate.setMinutes(tempDate.getMinutes() - tempDate.getTimezoneOffset());
          var readings = results[i].data.split(':');
          dataRow = [];
          dataRow.push(tempDate);
          for(var j = 0; j < channels.length; j++){
            if(timeScale == 'hour' || timeScale == 'halfday')
              dataRow.push(readings[channels[j]-1]*230);
            if(timeScale == 'day')
              dataRow.push(readings[j]*230);
          }
          data.push(dataRow);
        }

      } else if(type == "WTRLVL") {
        for(var i = 0; i < results.length; i++){
          dataRow = [];
          dataRow.push(new Date(results[i].receivedtime));
          dataRow.push(results[i].data/100);
          data.push(dataRow);
        }

      } else if(type == "TEMP") {
        for(var i = 0; i < results.length; i++){
          var tempDate = new Date(results[i].receivedtime);
          tempDate.setMinutes(tempDate.getMinutes() - tempDate.getTimezoneOffset());
          dataRow = [];
          dataRow.push(tempDate);
          dataRow.push(results[i].data.split(':')[0]);
          dataRow.push(results[i].data.split(':')[1]);
          dataRow.push(3);
          data.push(dataRow);
        }

      } else {
        for(var i = 0; i < results.length; i++){
          dataRow = [];
          dataRow.push(new Date(results[i].receivedtime));
          dataRow.push(results[i].data);
          data.push(dataRow);
        }
      }

    } else {
      if(type == "AMP") {
        dataRow = [];
        dataRow.push(new Date());
        for(var j = 0; j < channels.length; j++){
          dataRow.push('0');
        }
        data.push(dataRow);

      } else if(type == "TEMP") {
        dataRow = [];
        dataRow.push(new Date());
        dataRow.push('0');
        dataRow.push('0');
        data.push(dataRow);

      } else {
        dataRow = [];
        dataRow.push(new Date());
        dataRow.push('0');
        data.push(dataRow);
      }
    }

    res.send(data);
  });

});

function reduceResults(data, timeScale, startDate, endDate) {

  var tStartDate = new Date(startDate);
  var tEndDate = new Date(startDate);
  var tData = [];
  var dataPoints = [];
  var dataPointCount = 0;

  var diffMs = (endDate - startDate);
  var diffMins = diffMs / 60000;

  if(timeScale == 'day') {

    var minutes = 60;
    tEndDate.setMinutes(tEndDate.getMinutes() + minutes);

    for(var i = 0; i < diffMins / minutes; i++){

      dataPoint = 0;
      dataPointCount = 0;
      for(var j = 0; j < data.length; j++){
        if(data[j].receivedtime >= tStartDate && data[j].receivedtime <= tEndDate){
          dataPoint += Number(data[j].data);
          dataPointCount++;
        }
        if(data[j].receivedtime > tEndDate) break;
      }

      dataPoint = (dataPoint / dataPointCount).toFixed(1);

      tData.push({data: dataPoint, receivedtime: new Date(tStartDate)});

      tStartDate.setMinutes(tStartDate.getMinutes() + minutes);
      tEndDate.setMinutes(tEndDate.getMinutes() + minutes);
    }

  } else {
    tData = data;
  }

  return tData;
}

function reduceTempResults(data, timeScale, startDate, endDate) {

  var tStartDate = new Date(startDate);
  var tEndDate = new Date(startDate);
  var tData = [];
  var dataPoints = [];
  var dataPoints2 = [];
  var dataPointCount = 0;

  var diffMs = (endDate - startDate);
  var diffMins = diffMs / 60000;

  if(timeScale == 'day') {

    var minutes = 60;
    tEndDate.setMinutes(tEndDate.getMinutes() + minutes);

    for(var i = 0; i < diffMins / minutes; i++){

      dataPoint = 0;
      dataPoint2 = 0;
      dataPointCount = 0;
      for(var j = 0; j < data.length; j++){
        if(data[j].receivedtime >= tStartDate && data[j].receivedtime <= tEndDate){
          dataPoint += Number(data[j].data.split(':')[0]);
          dataPoint2 += Number(data[j].data.split(':')[1]);
          dataPointCount++;
        }
        if(data[j].receivedtime > tEndDate) break;
      }

      dataPoint = (dataPoint / dataPointCount).toFixed(1);
      dataPoint2 = (dataPoint2 / dataPointCount).toFixed(1);

      tData.push({data: dataPoint + ":" + dataPoint2, receivedtime: new Date(tStartDate)});

      tStartDate.setMinutes(tStartDate.getMinutes() + minutes);
      tEndDate.setMinutes(tEndDate.getMinutes() + minutes);
    }

  } else {
    tData = data;
  }

  return tData;
}

function reduceAmpResults(data, timeScale, startDate, endDate, channels) {

  var tStartDate = new Date(startDate);
  var tEndDate = new Date(startDate);
  var tData = [];
  var dataPoints = [];
  var dataPointCount = 0;

  var diffMs = (endDate - startDate);
  var diffMins = diffMs / 60000;

  if(timeScale == 'day') {

    var minutes = 60;
    tEndDate.setMinutes(tEndDate.getMinutes() + minutes);

    for(var i = 0; i < diffMins / minutes; i++){

      dataPoints = [];
      if(channels.indexOf('1') != -1) dataPoints.push(0);
      if(channels.indexOf('2') != -1) dataPoints.push(0);
      if(channels.indexOf('3') != -1) dataPoints.push(0);
      if(channels.indexOf('4') != -1) dataPoints.push(0);
      if(channels.indexOf('5') != -1) dataPoints.push(0);
      if(channels.indexOf('6') != -1) dataPoints.push(0);
      if(channels.indexOf('7') != -1) dataPoints.push(0);
      if(channels.indexOf('8') != -1) dataPoints.push(0);
      dataPointCount = 0;
      for(var j = 0; j < data.length; j++){
        if(data[j].receivedtime >= tStartDate && data[j].receivedtime <= tEndDate){
          var temp = 0;
          if(channels.indexOf('1') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[0]); temp++; }
          if(channels.indexOf('2') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[1]); temp++; }
          if(channels.indexOf('3') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[2]); temp++; }
          if(channels.indexOf('4') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[3]); temp++; }
          if(channels.indexOf('5') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[4]); temp++; }
          if(channels.indexOf('6') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[5]); temp++; }
          if(channels.indexOf('7') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[6]); temp++; }
          if(channels.indexOf('8') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[7]); temp++; }
          dataPointCount++;
        }
        if(data[j].receivedtime > tEndDate) break;
      }

      var temp = 0;
      if(channels.indexOf('1') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('2') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('3') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('4') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('5') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('6') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('7') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('8') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }


      tData.push({data: dataPoints.join(':'), receivedtime: new Date(tStartDate)});


      tStartDate.setMinutes(tStartDate.getMinutes() + minutes);
      tEndDate.setMinutes(tEndDate.getMinutes() + minutes);
    }

  } else if(timeScale == 'halfday') {

    var minutes = 1;
    tEndDate.setMinutes(tEndDate.getMinutes() + minutes);

    for(var i = 0; i < diffMins / minutes; i++){

      dataPoints = [];
      if(channels.indexOf('1') != -1) dataPoints.push(0);
      if(channels.indexOf('2') != -1) dataPoints.push(0);
      if(channels.indexOf('3') != -1) dataPoints.push(0);
      if(channels.indexOf('4') != -1) dataPoints.push(0);
      if(channels.indexOf('5') != -1) dataPoints.push(0);
      if(channels.indexOf('6') != -1) dataPoints.push(0);
      if(channels.indexOf('7') != -1) dataPoints.push(0);
      if(channels.indexOf('8') != -1) dataPoints.push(0);
      dataPointCount = 0;
      for(var j = 0; j < data.length; j++){
        if(data[j].receivedtime >= tStartDate && data[j].receivedtime <= tEndDate){
          var temp = 0;
          if(channels.indexOf('1') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[0]); temp++; }
          if(channels.indexOf('2') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[1]); temp++; }
          if(channels.indexOf('3') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[2]); temp++; }
          if(channels.indexOf('4') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[3]); temp++; }
          if(channels.indexOf('5') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[4]); temp++; }
          if(channels.indexOf('6') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[5]); temp++; }
          if(channels.indexOf('7') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[6]); temp++; }
          if(channels.indexOf('8') != -1) { dataPoints[temp] += Number(data[j].data.split(':')[7]); temp++; }
          dataPointCount++;
        }
        if(data[j].receivedtime > tEndDate) break;
      }

      var temp = 0;
      if(channels.indexOf('1') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('2') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('3') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('4') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('5') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('6') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('7') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }
      if(channels.indexOf('8') != -1) { if(dataPoints[temp]!=0) { dataPoints[temp] = (dataPoints[temp] / dataPointCount).toFixed(1); temp++; } else dataPoints.splice(temp, 1); }


      tData.push({data: dataPoints.join(':'), receivedtime: new Date(tStartDate)});


      tStartDate.setMinutes(tStartDate.getMinutes() + minutes);
      tEndDate.setMinutes(tEndDate.getMinutes() + minutes);
    }

  } else {
    tData = data;
  }

  return tData;
}



// =====POSTS=====


/* =====FUCNTIONS===== */

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

function getTwelveHourTime(time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] 
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}

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
