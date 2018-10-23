// ====Summary====
//
// /device/
// - Sends device page based on device type 
//
// /device/getdata
// - Get data for a device based on time, timescale and type
// - Setup data for google chart
//
// reduceResults() *multiple versions based on type
// - Reduces results to more managable averages based on timescale

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

      // Display based on device
      if(device.type == 'AMP') {
        res.render('device/amp', { title: 'AAH - Power Monitor', user: req.session.user, device: device });

      } else if(device.type == 'WTRHTR') {
        res.render('device/WTRHTR', { title: 'AAH - Water Heater', user: req.session.user, device: device });

      }

    } else {
      console.log("Error: No device found");
    }

  });
});

router.get('/getdata', checkSignIn, function(req, res) {

  // Power monitor variables
  var channels = []; // channels we're requesting
  if(req.query.channels) channels = req.query.channels.split(',');

  // Device variables
  var deviceMac = req.query.devicemac;
  var deviceType = req.query.devicetype;

  // Date variables
  var timeOffset = req.query.timeoffset;
  var timeScale = req.query.timescale;
  var startDate = req.query.startdate;
  var endDate = req.query.enddate;

  // Get data
  var sql = "SELECT * FROM data where devicemac = '"+deviceMac+"' and receivedtime > '"+startDate+"' and receivedtime < '"+endDate+"';";
  con.query(sql, function (err, results) {
    if (err) throw err;

    // Setup Fields
    var data = [];
    var dataRow = [];
    var offset = timeOffset - new Date().getTimezoneOffset(); // offset data received time

    // Based on type: Reduce results, put results into a google chart ready array with adjusted timezone, send array to client

    // ====Power Monitor====
    if(deviceType == "AMP") {

      // Reduce and average out results
      results = reduceAmpResults(results, timeScale, startDate, endDate, channels);

      // Setup data
      dataRow.push('Time');
      for(var i = 0; i < channels.length; i++){ // For each channel add a column title
        if(timeScale == 'hour' || timeScale == 'halfday') dataRow.push('KiloWatts');
        else if(timeScale == 'day') dataRow.push('KiloWatt Hours');
      }
      data.push(dataRow);

      if(results.length > 0) { // If we have data, put it into the data array
        for(var i = 0; i < results.length; i++){
          var tempDate = new Date(results[i].receivedtime);
          tempDate.setMinutes(tempDate.getMinutes() + offset);
          var readings = results[i].data.split(':');
          dataRow = [];
          dataRow.push(tempDate);
          for(var j = 0; j < channels.length; j++){
            if(timeScale == 'hour' || timeScale == 'halfday')
              dataRow.push(readings[channels[j]-1]*230/1000);
            if(timeScale == 'day')
              dataRow.push(readings[j]*230);
          }
          data.push(dataRow);
        }
      } else { // If we have no data, give single, false data point
        dataRow = [];
        dataRow.push(new Date());
        for(var j = 0; j < channels.length; j++){
          dataRow.push('0');
        }
        data.push(dataRow);
      }

      res.send(data);

    // ====Water Heater====
    } else if(deviceType == "WTRHTR") {

      var sql = "SELECT * FROM data where devicemac = '96:c6:4:bc:fa:ec' and receivedtime > '"+startDate+"' and receivedtime < '"+endDate+"';";
      con.query(sql, function (err, results2) {
        if (err) throw err;

        // Setup data
        dataRow.push('Time');
        dataRow.push('Temperature 1');
        dataRow.push('Temperature 2');
        dataRow.push('Power');
        data.push(dataRow);

        if(results.length > 0) { // If we have data, put it into an array

          // Reduce and average out results
          results = reduceResultsWTRHTR(results, timeScale, startDate, endDate, results2);

          for(var i = 0; i < results.length; i++){
            var tempDate = new Date(results[i].receivedtime);
            tempDate.setMinutes(tempDate.getMinutes() + offset);
            dataRow = [];
            dataRow.push(tempDate);
            dataRow.push(results[i].data.split(':')[0]);
            dataRow.push(results[i].data.split(':')[1]);
            if(results[i].data.split(':')[2] == 'NaN') dataRow.push(results[i].data.split(':')[2]);
            else dataRow.push(results[i].data.split(':')[2]*230/1000);
            if(dataRow[1] != 'NaN' || dataRow[2] != 'NaN' || dataRow[3] != 'NaN')
              data.push(dataRow);
          }
        } else { // If we have no data, give single, false data point
          dataRow = [];
          dataRow.push(new Date(startDate));
          dataRow.push(0);
          dataRow.push(0);
          dataRow.push(0);
          data.push(dataRow);
        }

        res.send(data);
      });
    }

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

function reduceResultsWTRHTR(data, timeScale, startDate, endDate, pwrData) {

  var startDate = new Date(startDate);
  var endDate = new Date(endDate);
  var tStartDate = new Date(startDate);
  var tEndDate = new Date(startDate);
  var tData = [];
  var dataPoints = [];
  var dataPoints2 = [];
  var dataPoints3 = [];
  var dataPointCount = 0;
  var dataPointCount2 = 0;
  var dataPointCount3 = 0;

  var diffMs = (endDate - startDate);
  var diffMins = diffMs / 60000;

  if(timeScale == 'day') {

    var minutes = 15;
    tEndDate.setMinutes(tEndDate.getMinutes() + minutes);

    for(var i = 0; i < diffMins / minutes; i++){

      dataPoint = 0;
      dataPoint2 = 0;
      dataPoint3 = 0;
      dataPointCount = 0;
      dataPointCount2 = 0;
      dataPointCount3 = 0;

      // Get temperature data points
      for(var j = 0; j < data.length; j++){
        if(data[j].receivedtime >= tStartDate && data[j].receivedtime <= tEndDate){
          if(Number(data[j].data.split(':')[0]) > 0) {
            dataPoint += Number(data[j].data.split(':')[0]);
            dataPointCount++;
          }
          if(Number(data[j].data.split(':')[1]) > 0) {
            dataPoint2 += Number(data[j].data.split(':')[1]);
            dataPointCount2++;
          }
        }
        if(data[j].receivedtime > tEndDate) break;
      }

      // Get power data point
      for(var j = 0; j < pwrData.length; j++){
        if(pwrData[j].receivedtime >= tStartDate && pwrData[j].receivedtime <= tEndDate){
          if(Number(pwrData[j].data.split(':')[3]) > 0) {
            dataPoint3 += Number(pwrData[j].data.split(':')[3]);
            dataPointCount3++;
          }
        }
        if(pwrData[j].receivedtime > tEndDate) break;
      }

      dataPoint = (dataPoint / dataPointCount).toFixed(1);
      dataPoint2 = (dataPoint2 / dataPointCount2).toFixed(1);
      dataPoint3 = (dataPoint3 / dataPointCount3);

      var tempStartDate = new Date(tStartDate);
      tData.push({data: dataPoint + ":" + dataPoint2 + ":" + dataPoint3, receivedtime: tempStartDate});

      tStartDate.setMinutes(tStartDate.getMinutes() + minutes);
      tEndDate.setMinutes(tEndDate.getMinutes() + minutes);
    }

  } else if(timeScale == 'hour') {

    var minutes = 1;
    tEndDate.setMinutes(tEndDate.getMinutes() + minutes);

    for(var i = 0; i < diffMins / minutes; i++){

      dataPoint = 0;
      dataPoint2 = 0;
      dataPoint3 = 0;
      dataPointCount = 0;
      dataPointCount2 = 0;
      dataPointCount3 = 0;

      // Get temperature data points
      for(var j = 0; j < data.length; j++){
        if(data[j].receivedtime >= tStartDate && data[j].receivedtime <= tEndDate){
          if(Number(data[j].data.split(':')[0]) > 0) {
            dataPoint += Number(data[j].data.split(':')[0]);
            dataPointCount++;
          }
          if(Number(data[j].data.split(':')[1]) > 0) {
            dataPoint2 += Number(data[j].data.split(':')[1]);
            dataPointCount2++;
          }
        }
        if(data[j].receivedtime > tEndDate) break;
      }

      // Get power data point
      for(var j = 0; j < pwrData.length; j++){
        if(pwrData[j].receivedtime >= tStartDate && pwrData[j].receivedtime <= tEndDate){
          if(Number(pwrData[j].data.split(':')[3]) > 0) {
            dataPoint3 += Number(pwrData[j].data.split(':')[3]);
            dataPointCount3++;
          }
        }
        if(pwrData[j].receivedtime > tEndDate) break;
      }

      dataPoint = (dataPoint / dataPointCount).toFixed(1);
      dataPoint2 = (dataPoint2 / dataPointCount2).toFixed(1);
      dataPoint3 = (dataPoint3 / dataPointCount3);

      var tempStartDate = new Date(tStartDate);
      tData.push({data: dataPoint + ":" + dataPoint2 + ":" + dataPoint3, receivedtime: tempStartDate});

      tStartDate.setMinutes(tStartDate.getMinutes() + minutes);
      tEndDate.setMinutes(tEndDate.getMinutes() + minutes);
    }

    // Add one last duplicate data point to round off pages
    var receivedtime = tData[tData.length-1].receivedtime;
    receivedtime.setMintues(60);
    tData.push({data: tData[tData.length-1].data, receivedtime: receivedtime});

  } else {
    tData = data;
  }

  return tData;
}

function reduceAmpResults(data, timeScale, startDate, endDate, channels) {

  var startDate = new Date(startDate);
  var endDate = new Date(endDate);
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

    var minutes = 10;
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


// =====FUCNTIONS=====

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
router.use('/getdata', function(err, req, res, next) {
  res.redirect('/');
});

module.exports = router;
